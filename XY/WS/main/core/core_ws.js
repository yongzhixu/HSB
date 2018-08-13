const qr = require('../../../QR/app_QR'); //读取图片base64
const config = require('../../../config');
const engine = require('../../../sPort/Engine_try');
const sleep = require('../../../HY/common/sleep');
const nodie = require('../../engine_start');
const pLimit = require('p-limit');
const baseMethods = require('../../baseMethods');
const limitS = pLimit(2);


//==============================================================状态检测===============================================/////////
const fetchStates = {
    all: async () => {
        const coilsState = await engine.states('coils', 0);
        if (coilsState.length > 0 && !coilsState[config.relay_rtu - 1]) {
            await engine.relayOn(config.relay_rtu);
            await sleep(config.rtu.engineNap);
        }
        const driverControllerState = await engine.states('motor', 0);
        const relayState = await engine.states('relay', 0);
        return {
            driverState: driverControllerState,
            relayState: relayState,
            coilsState: coilsState,
            position: 0,
        };
    },
    drivers: async () => {
        const driverControllerState = await engine.states('motor', 0);
        return {
            driverControllerState: driverControllerState,
            position: 0,
        };
    },
//继电器输入
    relays: async () => {
        const relayState = await engine.states('relay', 0);
        return {
            relayState: relayState,
            position: 0,
        };
    },
    //继电器开关
    coils: async () => {
        const coilsState = await engine.states('coils', 0);
        return {
            coilsState: coilsState,
            position: 0,
        };
    },
    stateAnalysis: async (states) => {
        await sleep(100);
        if (states.coilsState.length > 0 && !states.coilsState[config.relay_rtu - 1]) {
            await engine.relayOn(config.relay_rtu);
            return {
                position: '电机未开启',
                drawer: null,
            };
        } else {
            if (states.driverState.length > 0 && states.driverState[config.rtu_bottom - 1]) {
                //下限位
                if (states.driverState[config.rtu_drawer - 1]) {
                    return {
                        position: 'bottom',
                        drawer: 'closed',
                    };
                } else {
                    return {
                        position: 'bottom',
                        drawer: 'opened',
                    };
                }
            }
            else if (states.driverState.length > 0 && states.driverState[config.rtu_cap - 1]) {
                //上限位
                if (states.driverState[config.rtu_drawer - 1]) {
                    return {
                        position: 'top',
                        drawer: 'closed',
                    };
                } else {
                    return {
                        position: 'top',
                        drawer: 'opened',
                    };
                }
            }
            else if (states.driverState.length > 0 && states.driverState[config.rtu_stop - 1]) {
                //急停
                if (states.driverState.length > 0 && states.driverState[config.rtu_drawer - 1]) {
                    return {
                        position: 'float',
                        drawer: 'closed',
                    };
                } else {
                    return {
                        position: 'float',
                        drawer: 'opened',
                    };
                }
            }
            else {
                //其他
                if (states.driverState.length > 0 && states.driverState[config.rtu_drawer - 1]) {
                    return {
                        position: 'running',
                        drawer: 'closed',
                    };
                } else {
                    return {
                        position: 'running',
                        drawer: 'opened',
                    };
                }
            }
        }
    },
};
/**
 * 检测电磁锁的状态（通过继电器输入口状态）
 * @param pick [drawer:'托盘'; garage:'仓库']
 * @returns {Promise<*>}
 */
const lockCheck = async (pick) => {
    if (pick === 'drawer') {
        const drawer = await fetchStates.relays();
        if (drawer.relayState[config.drawer_lock - 1]) {
            return {drawerLock: true}
        } else {
            return {drawerLock: false}
        }
        // const
    } else if (pick === 'garage') {
        const garage = await fetchStates.relays();
        if (garage.relayState[config.garage_lock - 1]) {
            return {garageLock: true}
        } else {
            return {garageLock: false}
        }
    } else {
        return null
    }
}
const statesCheck = {
    //驱控器状态
    driverStates: async (pick) => {
        if (pick === 'up') {//上限位
            const drivers = await fetchStates.drivers();
            if (drivers.driverControllerState[config.rtu_cap - 1]) {
                return {state: true}
            } else {
                return {state: false}
            }
            // const
        } else if (pick === 'down') {//下限位
            const drivers = await fetchStates.drivers();
            if (drivers.driverControllerState[config.rtu_bottom - 1]) {
                return {state: true}
            } else {
                return {state: false}
            }
            // const
        } else if (pick === 'stop') {//急停位
            const drivers = await fetchStates.drivers();
            if (drivers.driverControllerState[config.rtu_stop - 1]) {
                return {state: true}
            } else {
                return {state: false}
            }
            // const
        } else if (pick === 'upGoing') {//上行启动
            const drivers = await fetchStates.drivers();
            if (drivers.driverControllerState[config.rtu_goingUp - 1]) {
                return {state: true}
            } else {
                return {state: false}
            }
            // const
        } else {
            return null
        }
    },
    //继电器开关状态
    coilsStates: async (pick) => {
        if (pick === 'motor') {//继电器是否通电
            const coils = await fetchStates.coils();
            if (coils.coilsState[config.relay_rtu - 1]) {
                return {state: true}
            } else {
                return {state: false}
            }
            // const
        }
        if (pick === 'drawer') {//继电器是否通电
            const coils = await fetchStates.coils();
            if (coils.coilsState[config.relay_rtu - 1]) {
                return {state: true}
            } else {
                return {state: false}
            }
            // const
        } else {
            return null
        }
    },
    //继电器输入口状态
    relaysStates: async (pick) => {
        if (pick === 'drawer') {
            const drawer = await fetchStates.relays();
            if (drawer.relayState[config.drawer_lock - 1]) {
                return {state: true}
            } else {
                return {state: false}
            }
            // const
        } else if (pick === 'garage') {
            const garage = await fetchStates.relays();
            if (garage.relayState[config.garage_lock - 1]) {
                return {state: true}
            } else {
                return {state: false}
            }
        } else if (pick === 'garageCap') {
            const garage = await fetchStates.relays();
            if (garage.relayState[config.garage_full - 1]) {
                return {state: true}
            } else {
                return {state: false}
            }
        } else {
            return null
        }
    },

};
const alarF_switch = {code: -1, msg: '限位开关故障', data: '限位开关故障'};

const redAlarm = async () => {
    const pos = await engine.rtuPos();//'01 03 00 16 00 02'; 显示坐标
    const corA = Buffer.from([pos[3], pos[4]]).readInt16BE(0);
    const corB = Buffer.from([pos[5], pos[6]]).readInt16BE(0); //{-1:'上行',0:'上行'}
    // console.log('corB', corB);
    const dis = corA - corB;
    // console.log(dis);
    if ((corB === -1 && dis > 20 || dis < -config.rtu.limit) || (corB === 0 && dis < -20 || dis > config.rtu.limit)) {
        await motorOff();
        return true;
    }
    return false;
};

const engineState = async () => {
    await motorRestart();
};

//==============================================================接口对应方法===============================================/////////
const motorOn = async () => {
    const state_coils = await fetchStates.coils().catch(() => {
        return {
            coilsState: [],
        }
    });
    console.log('motorOn', state_coils.coilsState);
    if (state_coils.coilsState.length > 0 && !state_coils.coilsState[config.relay_rtu - 1]) {
        engineSleepy = 0;
        await engine.relayOn(config.relay_rtu);
        await sleep(config.rtu.engineNap);
        return true;
    }
    return false;
};
const motorOff = async () => {
    await engine.relayOff(config.relay_rtu);
    await sleep(config.rtu.engineNap);
    return true;
};
const motorRestart = async () => {
    baseMethods.writeLog(`motorRestart`);
    await engine.relayOff(config.relay_rtu);
    await sleep(config.rtu.engineNap);
    await engine.relayOn(config.relay_rtu);
    console.log('motorRestart succeed')
    return true;
};

const F_lift_pack = async (data, fn) => {
    if (!data) {
        fn && fn({code: 1, msg: 'fails', data: 'none args'});
    }
    else {
        await engineState();
        // console.log('F_lift_pack', ws_imgEngine.shuo);
        if (ws_imgEngine.shuo) {
            await sleep(3000);
            fn && fn({code: 1, msg: 'waiting for last request to response', data: null});
        }
        else {
            baseMethods.writeLog(`平台升降==${data.job}`);
            await sleep(200);
            const state_coils = await fetchStates.coils().catch(() => {
                return {
                    coilsState: [],
                }
            });
            if (!state_coils.coilsState[config.relay_rtu - 1]) {
                await engine.relayOn(config.relay_rtu);
            }
            await sleep(500);
            const pos = await fetchStates.all();
            const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                return {
                    position: null,
                    drawer: null,
                }
            });
            console.log(ana);
            // ws_imgEngine.shuo = true;

            if (data.job === 'init_recycle') {
                //开始回收——float位置，开仓门
                if (ana.position === 'float') {
                    await engine.rtuStop();
                    const sw = await engine.switchOn();
                    if (sw) {
                        fn && fn({code: 0, msg: 'success', data: 'init_recycle'});
                    }
                    else {
                        fn && fn({code: 1, msg: 'fails', data: 'init_recycle'});
                    }
                }
                else if (ana.position === 'bottom') {
                    await engine.rtuUp();
                    const toutRun = setTimeout(async () => {
                        await engine.rtuUp();
                    }, 5000);
                    const intVal = setInterval(async () => {
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                            return {
                                position: null,
                                drawer: null,
                            }
                        });
                        if (ana.position === 'float') {
                            await engine.rtuStop();
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            const sw = await engine.switchOn();
                            if (sw) {
                                fn && fn({code: 0, msg: 'success', data: 'init_recycle'});
                            }
                            else {
                                fn && fn({code: 1, msg: 'fails', data: 'init_recycle'});
                            }
                        }
                        else {
                            const alarm = await redAlarm();
                            if (alarm) {
                                clearInterval(intVal);
                                clearTimeout(toutRun);
                                baseMethods.writeLog(`限位开关故障,init_recycle`);
                                fn && fn(alarF_switch);
                            }
                        }
                    }, config.rtu.stateAgain);
                }
                else {
                    await engine.rtuDown();
                    const toutRun = setTimeout(async () => {
                        await engine.rtuDown();
                    }, 10000);
                    const intVal = setInterval(async () => {
                        const alarm = await redAlarm();
                        if (alarm) {
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            baseMethods.writeLog(`限位开关故障,init_recycle`);
                            fn && fn(alarF_switch);
                        }
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                            return {
                                position: null,
                                drawer: null,
                            }
                        });

                        //如果急停开关为触碰开关，需要注销以下if代码
                        if (ana.position === 'float') {
                            await engine.rtuStop();
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            const sw = await engine.switchOn();
                            if (sw) {
                                fn && fn({code: 0, msg: 'success', data: 'init_recycle'});
                            }
                            else {
                                fn && fn({code: 1, msg: 'fails', data: 'init_recycle'});
                            }
                        }
                        else if (ana.position === 'bottom') {
                            await engine.rtuUp();
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            const toutRun2 = setTimeout(async () => {
                                await engine.rtuUp();
                            }, 20000);
                            const intVal2 = setInterval(async () => {
                                const pos = await fetchStates.all();
                                const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                                    return {
                                        position: null,
                                        drawer: null,
                                    }
                                });
                                if (ana.position === 'float') {
                                    await engine.rtuStop();
                                    clearInterval(intVal2);
                                    clearTimeout(toutRun2);
                                    const sw = await engine.switchOn();
                                    if (sw) {
                                        fn && fn({code: 0, msg: 'success', data: 'init_recycle'});
                                    }
                                    else {
                                        fn && fn({code: 1, msg: 'fails', data: 'init_recycle'});
                                    }
                                }
                            }, config.rtu.stateAgain);
                        }
                    }, config.rtu.stateAgain);
                }
            }
            else if (data.job === 'cell_detect') {
                //手机检测，bottom，不开仓门
                if (ana.position === 'bottom') {
                    await engine.rtuStop();
                    fn && fn({code: 0, msg: 'success', data: 'cell_detect'});
                } else {
                    await engine.rtuDown();
                    const toutRun = setTimeout(async () => {
                        await engine.rtuDown();
                    }, 5000);
                    const intVal = setInterval(async () => {
                        const alarm = await redAlarm();
                        if (alarm) {
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            baseMethods.writeLog(`限位开关故障,cell_detect`);
                            fn && fn(alarF_switch);
                        }
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                            return {
                                position: null,
                                drawer: null,
                            }
                        });
                        if (ana.position === 'float') {
                            await engine.rtuDown();
                        }
                        else if (ana.position === 'bottom') {
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            fn && fn({code: 0, msg: 'success', data: 'cell_detect'});
                        }
                    }, config.rtu.stateAgain);
                }
            }
            else if (data.job === 'quit_recycle') {
                console.log('quit_recycle');
                console.log('quit_recycle', ana);

                //放弃回收，top，开仓门
                if (ana.position === 'top') {
                    await engine.rtuStop();
                    const sw = await engine.switchOn();
                    if (sw) {
                        fn && fn({code: 0, msg: 'success', data: 'quit_recycle'});
                    }
                    else {
                        fn && fn({code: 1, msg: 'fails', data: 'quit_recycle'});
                    }
                }
                else {
                    await engine.rtuUp();
                    const toutRun = setTimeout(async () => {
                        await engine.rtuUp();
                    }, 5000);
                    let intFloat = 0;
                    const intVal = setInterval(async () => {
                        const alarm = await redAlarm();
                        if (alarm) {
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            baseMethods.writeLog(`限位开关故障,quit_recycle`);
                            fn && fn(alarF_switch);
                        }
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                            return {
                                position: null,
                                drawer: null,
                            }
                        });
                        console.log('quit_recycle 2', ana);

                        if (ana.position === 'top') {
                            await engine.rtuStop();
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            const sw = await engine.switchOn();
                            if (sw) {
                                fn && fn({code: 0, msg: 'success', data: 'quit_recycle'});
                            }
                            else {
                                fn && fn({code: 1, msg: 'fails', data: 'quit_recycle'});
                            }
                        }
                        if (ana.position === 'float' && intFloat === 0) {
                            await engine.rtuUp();
                            intFloat++;
                        }
                    }, config.rtu.stateAgain);
                }
            }
            else if (data.job === 'hesitate_recycle') {
                //判断是否为手机，top，不开仓门
                if (ana.position === 'top') {
                    await engine.rtuStop();
                    await engine.rtuPosZero();

                    fn && fn({code: 0, msg: 'success', data: 'hesitate_recycle'});
                } else {
                    await engine.rtuUp();
                    const toutRun = setTimeout(async () => {
                        await engine.rtuUp();
                    }, 5000);
                    let intFloat = 0;
                    const intVal = setInterval(async () => {
                        const alarm = await redAlarm();
                        if (alarm) {
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            baseMethods.writeLog(`限位开关故障,hesitate_recycle`);
                            fn && fn(alarF_switch);
                        }
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                            return {
                                position: null,
                                drawer: null,
                            }
                        });
                        if (ana.position === 'top') {
                            await engine.rtuStop();
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            await engine.rtuPosZero();

                            fn && fn({code: 0, msg: 'success', data: 'hesitate_recycle'});
                        }
                        if (ana.position === 'float' && intFloat === 0) {
                            await engine.rtuUp();
                            intFloat++;
                        }
                    }, config.rtu.stateAgain);
                }
            }
            else {
                fn && fn({code: 1, msg: 'fails', data: 'none verified destination'});
            }
        }
    }
};
const F_lift_to = async (data, fn) => {
    // 描述：获取当前升降平台的位置
    if (!data) {
        fn && fn({code: 1, msg: 'fails', data: 'none args'});
    }
    else {
        await engineState();
        await sleep(100);
        const state_coils = await fetchStates.coils().catch(() => {
            return {
                coilsState: [],
            }
        });
        // console.log(state_coils);
        if (!state_coils.coilsState[config.relay_rtu - 1]) {
            await engine.relayOn(config.relay_rtu);
            // fn&&fn([1, 'fails', '电机未开启');
        }
        // return;
        // console.log(123)
        await sleep(500);
        const pos = await fetchStates.all();
        // console.log(444);
        // console.log('pos',pos);
        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
            return {
                position: null,
                drawer: null,
            }
        });
        // console.log('ana',ana);
        // console.log(pos, ana);
        const des = data.destination;
        if (des === 'bottom') {
            //到底部
            if (ana.position === 'bottom') {
                await engine.rtuStop();
                fn && fn({code: 0, msg: 'success', data: 'bottom'});
            } else {
                await engine.rtuDown();
                const toutRun = setTimeout(async () => {
                    await engine.rtuDown();
                }, 5000);
                const intVal = setInterval(async () => {
                    const pos = await fetchStates.all();
                    const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                        return {
                            position: null,
                            drawer: null,
                        }
                    });
                    if (ana.position === 'float') {
                        await engine.rtuDown();
                    }
                    else if (ana.position === 'bottom') {
                        clearInterval(intVal);
                        clearTimeout(toutRun);
                        fn && fn({code: 0, msg: 'success', data: 'bottom'});
                    }
                }, config.rtu.stateAgain);
            }
        } else if (des === 'top') {
            //到顶部
            if (ana.position === 'top') {
                await engine.rtuStop();
                fn && fn({code: 0, msg: 'success', data: 'top'});
            } else {
                await engine.rtuUp();
                const toutRun = setTimeout(async () => {
                    await engine.rtuUp();
                }, 5000);
                let intFloat = 0;
                const intVal = setInterval(async () => {
                    const pos = await fetchStates.all();
                    const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                        return {
                            position: null,
                            drawer: null,
                        }
                    });
                    if (ana.position === 'top') {
                        await engine.rtuStop();
                        clearInterval(intVal);
                        clearTimeout(toutRun);
                        fn && fn({code: 0, msg: 'success', data: 'top'});
                    }
                    if (ana.position === 'float' && intFloat === 0) {
                        await engine.rtuUp();
                        intFloat++;
                    }
                }, config.rtu.stateAgain);
            }
        } else if (des === 'float') {
            //到急停位置
            if (ana.position === 'float') {
                await engine.rtuStop();
                fn && fn({code: 0, msg: 'success', data: 'float'});
            } else if (ana.position === 'bottom') {
                await engine.rtuUp();
                const toutRun = setTimeout(async () => {
                    await engine.rtuUp();
                }, 5000);
                const intVal = setInterval(async () => {
                    const pos = await fetchStates.all();
                    const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                        return {
                            position: null,
                            drawer: null,
                        }
                    });
                    if (ana.position === 'float') {
                        await engine.rtuStop();
                        clearInterval(intVal);
                        clearTimeout(toutRun);
                        fn && fn({code: 0, msg: 'success', data: 'float'});
                    }
                }, config.rtu.stateAgain);
            } else {
                await engine.rtuDown();
                const toutRun = setTimeout(async () => {
                    await engine.rtuDown();
                }, 5000);
                const intVal = setInterval(async () => {
                    const pos = await fetchStates.all();
                    const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                        return {
                            position: null,
                            drawer: null,
                        }
                    });
                    if (ana.position === 'bottom') {
                        await engine.rtuUp();
                        clearInterval(intVal);
                        clearTimeout(toutRun);
                        const toutRun2 = setTimeout(async () => {
                            await engine.rtuUp();
                        }, 20000);
                        const intVal2 = setInterval(async () => {
                            const pos = await fetchStates.all();
                            const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                                return {
                                    position: null,
                                    drawer: null,
                                }
                            });
                            if (ana.position === 'float') {
                                await engine.rtuStop();
                                clearInterval(intVal2);
                                clearTimeout(toutRun2);
                                fn && fn({code: 0, msg: 'success', data: 'float'});
                            }
                        }, config.rtu.stateAgain);
                    }
                }, config.rtu.stateAgain);
            }
        }
        else {
            fn && fn({code: 1, msg: 'fails', data: 'none verified destination'});
        }
    }
};
const F_Wait_drawerClose = async (data, fn) => {
    // if (ws_imgEngine.shuo) {
    //     await sleep(3000);
    //     fn([1, 'waiting for last request to response', new Error()]);
    // }
    // else {
    //     // ws_imgEngine.shuo = true;
    //     if (!data) {
    //         ws_imgEngine.shuo = false;
    //         fn([1, 'fails', null]);
    //     }
    //     else {
    //         if (data.time === config.rtu.stateAgain) {
    //             data.time += 200;
    //         }
    //         await sleep(100);
    //         const drawer = await lockCheck('drawer');
    //         console.log('drawer',drawer)
    //         if (drawer && drawer.drawerLock) {
    //             ws_imgEngine.shuo = false;
    //             fn([0, 'success', {closed: true}]);
    //         } else {
    //             let intval = null;
    //             const tout = setTimeout(async () => {
    //                 clearTimeout(tout);
    //                 clearInterval(intval);
    //                 const drawer =await lockCheck('drawer');
    //                 if (drawer && drawer.drawerLock) {
    //                     ws_imgEngine.shuo = false;
    //                     fn([0, 'success', {closed: true}]);
    //                 } else {
    //                     ws_imgEngine.shuo = false;
    //                     fn([0, 'success', {closed: false});
    //                     // throw Error;
    //                 }
    //             }, data.time);
    //             intval = setInterval(async () => {
    //                 const drawer =await lockCheck('drawer');
    //                 if (drawer && drawer.drawerLock) {
    //                     clearTimeout(tout);
    //                     clearInterval(intval);
    //                     ws_imgEngine.shuo = false;
    //                     fn([0, 'success', {closed: true}]);
    //                 }
    //             }, config.rtu.stateAgain)
    //         }
    //     }
    // }

    if (ws_imgEngine.shuo) {
        await sleep(3000);
        fn && fn([1, 'waiting for last request to response', new Error()]);
    }
    else {
        // ws_imgEngine.shuo = true;
        if (!data) {
            ws_imgEngine.shuo = false;
            fn && fn([1, 'fails', null]);
        }
        else {
            baseMethods.writeLog(`等待检测台关闭==${data}`);
            if (data.time === config.rtu.stateAgain) {
                data.time += 200;
            }
            await sleep(100);
            const drawer = await lockCheck('drawer');
            console.log('drawer', drawer)
            if (drawer && drawer.drawerLock) {
                ws_imgEngine.shuo = false;
                // fn && fn([0, 'success', {closed: true}]);
                fn && fn([0, 'success', {drawer: 'closed'}]);
            } else {
                let intval = null;
                const tout = setTimeout(async () => {
                    clearTimeout(tout);
                    clearInterval(intval);
                    const drawer = await lockCheck('drawer');
                    if (drawer && drawer.drawerLock) {
                        ws_imgEngine.shuo = false;
                        // fn && fn([0, 'success', {closed: true}]);
                        fn && fn([0, 'success', {drawer: 'closed'}]);

                    } else {
                        ws_imgEngine.shuo = false;
                        // fn && fn([0, 'success', {closed: false}]);
                        fn && fn([0, 'success', {drawer: 'open'}]);

                        // throw Error;
                    }
                }, data.time);
                intval = setInterval(async () => {
                    const drawer = await lockCheck('drawer');
                    if (drawer && drawer.drawerLock) {
                        clearTimeout(tout);
                        clearInterval(intval);
                        ws_imgEngine.shuo = false;
                        // fn && fn([0, 'success', {closed: true}]);
                        fn && fn([0, 'success', {drawer: 'closed'}]);

                    }
                }, config.rtu.stateAgain)
            }
        }
    }
};
const F_Wait_drawerOut = async (data, fn) => {
    if (ws_imgEngine.shuo) {
        await sleep(3000);
        fn && fn([1, 'waiting for last request to response', new Error()]);
    }
    else {
        await motorOn();
        // ws_imgEngine.shuo = true;
        // 描述：等待抽屉关闭
        // time	number类型	等待门关闭的时间，感应门关闭直接返回，超出 time 时间，报错
        console.log('F_Wait_drawerOut');
        console.log(data.time);
        if (!data.time) {
            ws_imgEngine.shuo = false;
            fn && fn([1, 'fails', 'data.time null']);
        }
        else {
            baseMethods.writeLog(`等待检测台抽出==${data}`);
            if (data.time === config.rtu.stateAgain) {
                data.time += 200;
            }
            await sleep(100);
            let drawerOut = await statesCheck.driverStates('upGoing');
            const drawer = await lockCheck('drawer');
            if (drawerOut.state) {
                ws_imgEngine.shuo = false;
                if (drawer && drawer.drawerLock) {
                    fn && fn([0, 'success', {isOut: true, closed: true}]);
                } else {
                    fn && fn([0, 'success', {isOut: true, closed: false}]);
                }
            } else {
                let intval = null;
                const tout = setTimeout(async () => {
                    await motorOn();
                    clearInterval(intval);
                    drawerOut = drawerOut = await statesCheck.driverStates('upGoing');
                    const drawer = await lockCheck('drawer');
                    if (drawerOut.state) {
                        ws_imgEngine.shuo = false;
                        if (drawer && drawer.drawerLock) {
                            fn && fn([0, 'success', {isOut: true, closed: true}]);
                        } else {
                            fn && fn([0, 'success', {isOut: true, closed: false}]);
                        }
                    } else {
                        ws_imgEngine.shuo = false;
                        if (drawer && drawer.drawerLock) {
                            fn && fn([0, 'success', {isOut: false, closed: true}]);
                        } else {
                            fn && fn([0, 'success', {isOut: false, closed: false}]);
                        }
                        // throw Error;
                    }
                }, data.time);
                intval = setInterval(async () => {
                    await motorOn();
                    drawerOut = await statesCheck.driverStates('upGoing');
                    const drawer = await lockCheck('drawer');
                    if (drawerOut.state) {
                        clearTimeout(tout);
                        clearInterval(intval);
                        ws_imgEngine.shuo = false;
                        if (drawer && drawer.drawerLock) {
                            fn && fn([0, 'success', {isOut: true, closed: true}]);
                        } else {
                            fn && fn([0, 'success', {isOut: true, closed: false}]);
                        }
                    }
                }, config.rtu.stateAgain)
            }
        }
    }
}
let ws_imgEngine = {};
//==============================================================接口===============================================/////////
module.exports = {
    yourName: function (data, fn) {
        fn([0, 'success', {name: 'imgEngine'}]);
    },
    async F_relayOn(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // 描述：获取二维码。
                    const res = await engine.relayOn(data.num);
                    if (res) {
                        ws_imgEngine.shuo = false;
                        fn([0, 'success', data]);
                    }
                    else {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', data]);
                    }
                }
            }
        );

    },
    async F_relayOff(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;

                    // 描述：获取二维码。
                    const res = await engine.relayOff(data.num);
                    if (res) {
                        ws_imgEngine.shuo = false;
                        fn([0, 'success', data]);
                    }
                    else {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', data]);
                    }
                }
            }
        );

    },
    /**
     * decode qr code from image
     * @param data
     * @param fn
     * @returns {Promise<void>}
     */
    async F_getQRCode(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;
                    // 描述：获取二维码。
                    await qr.imageQR((data) => {
                        if (data.qrInfo.code === 1) {
                            ws_imgEngine.shuo = false;
                            fn([1, 'fails', data]);
                        }
                        else {
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', data]);
                        }
                    })
                }
            }
        );
    },
    /**
     * take photo and delivery it as base64 format
     * @param data
     * @param fn
     * @returns {Promise<void>}
     */
    async F_getImg64(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;

                    // 描述：获取二维码。
                    await qr.image64(data.expose, (data) => {
                        if (!data.img64) {
                            ws_imgEngine.shuo = false;
                            fn([1, 'fails', data]);
                        }
                        else {
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', data]);
                        }
                    })
                }
            }
        );

    },
    async F_Run_lift(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;

                    // 描述：获取当前升降平台的位置
                    if (!data) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', {data: null}]);
                    }
                    else {
                        if (data.switch === 'up') {
                            const res = await engine.rtuUp();
                            console.log(res);
                            if (res) {

                                ws_imgEngine.shuo = false;

                                fn([0, 'success', 'up']);
                            }
                            else {

                                ws_imgEngine.shuo = false;

                                fn([1, 'fails', 'up']);
                            }
                        } else if (data.switch === 'down') {
                            const res = await engine.rtuDown();
                            // console.log(res);
                            if (res) {
                                ws_imgEngine.shuo = false;

                                fn([0, 'success', 'down']);
                            }
                            else {
                                ws_imgEngine.shuo = false;

                                fn([1, 'fails', 'down']);
                            }
                        }
                    }
                }
            }
        );

    },
    async F_Run_stop(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;

                    // 描述：停止
                    const res = await engine.rtuStop();
                    if (res) {
                        ws_imgEngine.shuo = false;
                        fn([0, 'success', 'stopped']);
                    }
                    else {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', 'stopped']);
                    }
                }
            }
        );
    },
    /**
     * open the drawer
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_Run_drawer(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;

                    // 描述：打开抽屉
                    const res = await engine.switchOn();
                    if (res) {
                        ws_imgEngine.shuo = false;
                        fn([0, 'success', 'drawerOpen']);
                    }
                    else {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', 'drawerOpen']);
                    }
                }
            }
        );

    },
    /**
     * 等待托盘抽出
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_Wait_drawerOut(data, fn){
    if (ws_imgEngine.shuo) {
        await sleep(3000);
        fn && fn([1, 'waiting for last request to response', new Error()]);
    }
    else {
        await motorOn();
        // ws_imgEngine.shuo = true;
        // 描述：等待抽屉关闭
        // time	number类型	等待门关闭的时间，感应门关闭直接返回，超出 time 时间，报错
        console.log('F_Wait_drawerOut');
        console.log(data.time);
        if (!data.time) {
            ws_imgEngine.shuo = false;
            fn && fn([1, 'fails', 'data.time null']);
        }
        else {
            baseMethods.writeLog(`等待检测台抽出==${data}`);
            if (data.time === config.rtu.stateAgain) {
                data.time += 200;
            }
            await sleep(100);
            let drawerOut = await statesCheck.driverStates('upGoing');
            const drawer = await lockCheck('drawer');
            if (drawerOut.state) {
                ws_imgEngine.shuo = false;
                if (drawer && drawer.drawerLock) {
                    fn && fn([0, 'success', {isOut: true, closed: true}]);
                } else {
                    fn && fn([0, 'success', {isOut: true, closed: false}]);
                }
            } else {
                let intval = null;
                const tout = setTimeout(async () => {
                    await motorOn();
                    clearInterval(intval);
                    drawerOut = drawerOut = await statesCheck.driverStates('upGoing');
                    const drawer = await lockCheck('drawer');
                    if (drawerOut.state) {
                        ws_imgEngine.shuo = false;
                        if (drawer && drawer.drawerLock) {
                            fn && fn([0, 'success', {isOut: true, closed: true}]);
                        } else {
                            fn && fn([0, 'success', {isOut: true, closed: false}]);
                        }
                    } else {
                        ws_imgEngine.shuo = false;
                        if (drawer && drawer.drawerLock) {
                            fn && fn([0, 'success', {isOut: false, closed: true}]);
                        } else {
                            fn && fn([0, 'success', {isOut: false, closed: false}]);
                        }
                        // throw Error;
                    }
                }, data.time);
                intval = setInterval(async () => {
                    await motorOn();
                    drawerOut = await statesCheck.driverStates('upGoing');
                    const drawer = await lockCheck('drawer');
                    if (drawerOut.state) {
                        clearTimeout(tout);
                        clearInterval(intval);
                        ws_imgEngine.shuo = false;
                        if (drawer && drawer.drawerLock) {
                            fn && fn([0, 'success', {isOut: true, closed: true}]);
                        } else {
                            fn && fn([0, 'success', {isOut: true, closed: false}]);
                        }
                    }
                }, config.rtu.stateAgain)
            }
        }
    }
},
    /**
     * 等待托盘关闭
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_Wait_drawerClose (data, fn) {
    // if (ws_imgEngine.shuo) {
    //     await sleep(3000);
    //     fn([1, 'waiting for last request to response', new Error()]);
    // }
    // else {
    //     // ws_imgEngine.shuo = true;
    //     if (!data) {
    //         ws_imgEngine.shuo = false;
    //         fn([1, 'fails', null]);
    //     }
    //     else {
    //         if (data.time === config.rtu.stateAgain) {
    //             data.time += 200;
    //         }
    //         await sleep(100);
    //         const drawer = await lockCheck('drawer');
    //         console.log('drawer',drawer)
    //         if (drawer && drawer.drawerLock) {
    //             ws_imgEngine.shuo = false;
    //             fn([0, 'success', {closed: true}]);
    //         } else {
    //             let intval = null;
    //             const tout = setTimeout(async () => {
    //                 clearTimeout(tout);
    //                 clearInterval(intval);
    //                 const drawer =await lockCheck('drawer');
    //                 if (drawer && drawer.drawerLock) {
    //                     ws_imgEngine.shuo = false;
    //                     fn([0, 'success', {closed: true}]);
    //                 } else {
    //                     ws_imgEngine.shuo = false;
    //                     fn([0, 'success', {closed: false});
    //                     // throw Error;
    //                 }
    //             }, data.time);
    //             intval = setInterval(async () => {
    //                 const drawer =await lockCheck('drawer');
    //                 if (drawer && drawer.drawerLock) {
    //                     clearTimeout(tout);
    //                     clearInterval(intval);
    //                     ws_imgEngine.shuo = false;
    //                     fn([0, 'success', {closed: true}]);
    //                 }
    //             }, config.rtu.stateAgain)
    //         }
    //     }
    // }

    if (ws_imgEngine.shuo) {
        await sleep(3000);
        fn && fn([1, 'waiting for last request to response', new Error()]);
    }
    else {
        // ws_imgEngine.shuo = true;
        if (!data) {
            ws_imgEngine.shuo = false;
            fn && fn([1, 'fails', null]);
        }
        else {
            baseMethods.writeLog(`等待检测台关闭==${data}`);
            if (data.time === config.rtu.stateAgain) {
                data.time += 200;
            }
            await sleep(100);
            const drawer = await lockCheck('drawer');
            console.log('drawer', drawer)
            if (drawer && drawer.drawerLock) {
                ws_imgEngine.shuo = false;
                // fn && fn([0, 'success', {closed: true}]);
                fn && fn([0, 'success', {drawer: 'closed'}]);
            } else {
                let intval = null;
                const tout = setTimeout(async () => {
                    clearTimeout(tout);
                    clearInterval(intval);
                    const drawer = await lockCheck('drawer');
                    if (drawer && drawer.drawerLock) {
                        ws_imgEngine.shuo = false;
                        // fn && fn([0, 'success', {closed: true}]);
                        fn && fn([0, 'success', {drawer: 'closed'}]);

                    } else {
                        ws_imgEngine.shuo = false;
                        // fn && fn([0, 'success', {closed: false}]);
                        fn && fn([0, 'success', {drawer: 'open'}]);

                        // throw Error;
                    }
                }, data.time);
                intval = setInterval(async () => {
                    const drawer = await lockCheck('drawer');
                    if (drawer && drawer.drawerLock) {
                        clearTimeout(tout);
                        clearInterval(intval);
                        ws_imgEngine.shuo = false;
                        // fn && fn([0, 'success', {closed: true}]);
                        fn && fn([0, 'success', {drawer: 'closed'}]);

                    }
                }, config.rtu.stateAgain)
            }
        }
    }
},
    /**
     * 查询托盘关闭状态
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_drawer_check(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;
                    if (!data) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', null]);
                    }
                    else {
                        const drawer = await lockCheck('drawer');
                        if (drawer) {
                            if (drawer.drawerLock) {
                                ws_imgEngine.shuo = false;
                                fn([0, 'success', {opened: false}]);
                            } else {
                                fn([0, 'success', {opened: true}]);
                            }
                        }
                        else {
                            fn([1, 'query failed', null])
                        }
                    }
                }
            }
        );
    },
    async F_Query_lift(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;

                    // 描述：获取当前升降平台的位置
                    if (!data) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', {data: null}]);
                    }
                    else {
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos);
                        if (ana) {
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', ana]);
                        } else {
                            ws_imgEngine.shuo = false;
                            fn([1, 'fails', ana]);
                        }
                    }
                }
            }
        );

    },
    async F_lift_to (data, fn) {
    // 描述：获取当前升降平台的位置
    if (!data) {
        fn && fn({code: 1, msg: 'fails', data: 'none args'});
    }
    else {
        await engineState();
        await sleep(100);
        const state_coils = await fetchStates.coils().catch(() => {
            return {
                coilsState: [],
            }
        });
        // console.log(state_coils);
        if (!state_coils.coilsState[config.relay_rtu - 1]) {
            await engine.relayOn(config.relay_rtu);
            // fn&&fn([1, 'fails', '电机未开启');
        }
        // return;
        // console.log(123)
        await sleep(500);
        const pos = await fetchStates.all();
        // console.log(444);
        // console.log('pos',pos);
        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
            return {
                position: null,
                drawer: null,
            }
        });
        // console.log('ana',ana);
        // console.log(pos, ana);
        const des = data.destination;
        if (des === 'bottom') {
            //到底部
            if (ana.position === 'bottom') {
                await engine.rtuStop();
                fn && fn({code: 0, msg: 'success', data: 'bottom'});
            } else {
                await engine.rtuDown();
                const toutRun = setTimeout(async () => {
                    await engine.rtuDown();
                }, 5000);
                const intVal = setInterval(async () => {
                    const pos = await fetchStates.all();
                    const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                        return {
                            position: null,
                            drawer: null,
                        }
                    });
                    if (ana.position === 'float') {
                        await engine.rtuDown();
                    }
                    else if (ana.position === 'bottom') {
                        clearInterval(intVal);
                        clearTimeout(toutRun);
                        fn && fn({code: 0, msg: 'success', data: 'bottom'});
                    }
                }, config.rtu.stateAgain);
            }
        } else if (des === 'top') {
            //到顶部
            if (ana.position === 'top') {
                await engine.rtuStop();
                fn && fn({code: 0, msg: 'success', data: 'top'});
            } else {
                await engine.rtuUp();
                const toutRun = setTimeout(async () => {
                    await engine.rtuUp();
                }, 5000);
                let intFloat = 0;
                const intVal = setInterval(async () => {
                    const pos = await fetchStates.all();
                    const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                        return {
                            position: null,
                            drawer: null,
                        }
                    });
                    if (ana.position === 'top') {
                        await engine.rtuStop();
                        clearInterval(intVal);
                        clearTimeout(toutRun);
                        fn && fn({code: 0, msg: 'success', data: 'top'});
                    }
                    if (ana.position === 'float' && intFloat === 0) {
                        await engine.rtuUp();
                        intFloat++;
                    }
                }, config.rtu.stateAgain);
            }
        } else if (des === 'float') {
            //到急停位置
            if (ana.position === 'float') {
                await engine.rtuStop();
                fn && fn({code: 0, msg: 'success', data: 'float'});
            } else if (ana.position === 'bottom') {
                await engine.rtuUp();
                const toutRun = setTimeout(async () => {
                    await engine.rtuUp();
                }, 5000);
                const intVal = setInterval(async () => {
                    const pos = await fetchStates.all();
                    const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                        return {
                            position: null,
                            drawer: null,
                        }
                    });
                    if (ana.position === 'float') {
                        await engine.rtuStop();
                        clearInterval(intVal);
                        clearTimeout(toutRun);
                        fn && fn({code: 0, msg: 'success', data: 'float'});
                    }
                }, config.rtu.stateAgain);
            } else {
                await engine.rtuDown();
                const toutRun = setTimeout(async () => {
                    await engine.rtuDown();
                }, 5000);
                const intVal = setInterval(async () => {
                    const pos = await fetchStates.all();
                    const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                        return {
                            position: null,
                            drawer: null,
                        }
                    });
                    if (ana.position === 'bottom') {
                        await engine.rtuUp();
                        clearInterval(intVal);
                        clearTimeout(toutRun);
                        const toutRun2 = setTimeout(async () => {
                            await engine.rtuUp();
                        }, 20000);
                        const intVal2 = setInterval(async () => {
                            const pos = await fetchStates.all();
                            const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                                return {
                                    position: null,
                                    drawer: null,
                                }
                            });
                            if (ana.position === 'float') {
                                await engine.rtuStop();
                                clearInterval(intVal2);
                                clearTimeout(toutRun2);
                                fn && fn({code: 0, msg: 'success', data: 'float'});
                            }
                        }, config.rtu.stateAgain);
                    }
                }, config.rtu.stateAgain);
            }
        }
        else {
            fn && fn({code: 1, msg: 'fails', data: 'none verified destination'});
        }
    }
},
    async F_lift_pack(data, fn) {
    if (!data) {
        fn && fn({code: 1, msg: 'fails', data: 'none args'});
    }
    else {
        await engineState();
        // console.log('F_lift_pack', ws_imgEngine.shuo);
        if (ws_imgEngine.shuo) {
            await sleep(3000);
            fn && fn({code: 1, msg: 'waiting for last request to response', data: null});
        }
        else {
            baseMethods.writeLog(`平台升降==${data.job}`);
            await sleep(200);
            const state_coils = await fetchStates.coils().catch(() => {
                return {
                    coilsState: [],
                }
            });
            if (!state_coils.coilsState[config.relay_rtu - 1]) {
                await engine.relayOn(config.relay_rtu);
            }
            await sleep(500);
            const pos = await fetchStates.all();
            const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                return {
                    position: null,
                    drawer: null,
                }
            });
            console.log(ana);
            // ws_imgEngine.shuo = true;

            if (data.job === 'init_recycle') {
                //开始回收——float位置，开仓门
                if (ana.position === 'float') {
                    await engine.rtuStop();
                    const sw = await engine.switchOn();
                    if (sw) {
                        fn && fn({code: 0, msg: 'success', data: 'init_recycle'});
                    }
                    else {
                        fn && fn({code: 1, msg: 'fails', data: 'init_recycle'});
                    }
                }
                else if (ana.position === 'bottom') {
                    await engine.rtuUp();
                    const toutRun = setTimeout(async () => {
                        await engine.rtuUp();
                    }, 5000);
                    const intVal = setInterval(async () => {
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                            return {
                                position: null,
                                drawer: null,
                            }
                        });
                        if (ana.position === 'float') {
                            await engine.rtuStop();
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            const sw = await engine.switchOn();
                            if (sw) {
                                fn && fn({code: 0, msg: 'success', data: 'init_recycle'});
                            }
                            else {
                                fn && fn({code: 1, msg: 'fails', data: 'init_recycle'});
                            }
                        }
                        else {
                            const alarm = await redAlarm();
                            if (alarm) {
                                clearInterval(intVal);
                                clearTimeout(toutRun);
                                baseMethods.writeLog(`限位开关故障,init_recycle`);
                                fn && fn(alarF_switch);
                            }
                        }
                    }, config.rtu.stateAgain);
                }
                else {
                    await engine.rtuDown();
                    const toutRun = setTimeout(async () => {
                        await engine.rtuDown();
                    }, 10000);
                    const intVal = setInterval(async () => {
                        const alarm = await redAlarm();
                        if (alarm) {
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            baseMethods.writeLog(`限位开关故障,init_recycle`);
                            fn && fn(alarF_switch);
                        }
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                            return {
                                position: null,
                                drawer: null,
                            }
                        });

                        //如果急停开关为触碰开关，需要注销以下if代码
                        if (ana.position === 'float') {
                            await engine.rtuStop();
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            const sw = await engine.switchOn();
                            if (sw) {
                                fn && fn({code: 0, msg: 'success', data: 'init_recycle'});
                            }
                            else {
                                fn && fn({code: 1, msg: 'fails', data: 'init_recycle'});
                            }
                        }
                        else if (ana.position === 'bottom') {
                            await engine.rtuUp();
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            const toutRun2 = setTimeout(async () => {
                                await engine.rtuUp();
                            }, 20000);
                            const intVal2 = setInterval(async () => {
                                const pos = await fetchStates.all();
                                const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                                    return {
                                        position: null,
                                        drawer: null,
                                    }
                                });
                                if (ana.position === 'float') {
                                    await engine.rtuStop();
                                    clearInterval(intVal2);
                                    clearTimeout(toutRun2);
                                    const sw = await engine.switchOn();
                                    if (sw) {
                                        fn && fn({code: 0, msg: 'success', data: 'init_recycle'});
                                    }
                                    else {
                                        fn && fn({code: 1, msg: 'fails', data: 'init_recycle'});
                                    }
                                }
                            }, config.rtu.stateAgain);
                        }
                    }, config.rtu.stateAgain);
                }
            }
            else if (data.job === 'cell_detect') {
                //手机检测，bottom，不开仓门
                if (ana.position === 'bottom') {
                    await engine.rtuStop();
                    fn && fn({code: 0, msg: 'success', data: 'cell_detect'});
                } else {
                    await engine.rtuDown();
                    const toutRun = setTimeout(async () => {
                        await engine.rtuDown();
                    }, 5000);
                    const intVal = setInterval(async () => {
                        const alarm = await redAlarm();
                        if (alarm) {
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            baseMethods.writeLog(`限位开关故障,cell_detect`);
                            fn && fn(alarF_switch);
                        }
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                            return {
                                position: null,
                                drawer: null,
                            }
                        });
                        if (ana.position === 'float') {
                            await engine.rtuDown();
                        }
                        else if (ana.position === 'bottom') {
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            fn && fn({code: 0, msg: 'success', data: 'cell_detect'});
                        }
                    }, config.rtu.stateAgain);
                }
            }
            else if (data.job === 'quit_recycle') {
                console.log('quit_recycle');
                console.log('quit_recycle', ana);

                //放弃回收，top，开仓门
                if (ana.position === 'top') {
                    await engine.rtuStop();
                    const sw = await engine.switchOn();
                    if (sw) {
                        fn && fn({code: 0, msg: 'success', data: 'quit_recycle'});
                    }
                    else {
                        fn && fn({code: 1, msg: 'fails', data: 'quit_recycle'});
                    }
                }
                else {
                    await engine.rtuUp();
                    const toutRun = setTimeout(async () => {
                        await engine.rtuUp();
                    }, 5000);
                    let intFloat = 0;
                    const intVal = setInterval(async () => {
                        const alarm = await redAlarm();
                        if (alarm) {
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            baseMethods.writeLog(`限位开关故障,quit_recycle`);
                            fn && fn(alarF_switch);
                        }
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                            return {
                                position: null,
                                drawer: null,
                            }
                        });
                        console.log('quit_recycle 2', ana);

                        if (ana.position === 'top') {
                            await engine.rtuStop();
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            const sw = await engine.switchOn();
                            if (sw) {
                                fn && fn({code: 0, msg: 'success', data: 'quit_recycle'});
                            }
                            else {
                                fn && fn({code: 1, msg: 'fails', data: 'quit_recycle'});
                            }
                        }
                        if (ana.position === 'float' && intFloat === 0) {
                            await engine.rtuUp();
                            intFloat++;
                        }
                    }, config.rtu.stateAgain);
                }
            }
            else if (data.job === 'hesitate_recycle') {
                //判断是否为手机，top，不开仓门
                if (ana.position === 'top') {
                    await engine.rtuStop();
                    await engine.rtuPosZero();

                    fn && fn({code: 0, msg: 'success', data: 'hesitate_recycle'});
                } else {
                    await engine.rtuUp();
                    const toutRun = setTimeout(async () => {
                        await engine.rtuUp();
                    }, 5000);
                    let intFloat = 0;
                    const intVal = setInterval(async () => {
                        const alarm = await redAlarm();
                        if (alarm) {
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            baseMethods.writeLog(`限位开关故障,hesitate_recycle`);
                            fn && fn(alarF_switch);
                        }
                        const pos = await fetchStates.all();
                        const ana = await fetchStates.stateAnalysis(pos).catch(() => {
                            return {
                                position: null,
                                drawer: null,
                            }
                        });
                        if (ana.position === 'top') {
                            await engine.rtuStop();
                            clearInterval(intVal);
                            clearTimeout(toutRun);
                            await engine.rtuPosZero();

                            fn && fn({code: 0, msg: 'success', data: 'hesitate_recycle'});
                        }
                        if (ana.position === 'float' && intFloat === 0) {
                            await engine.rtuUp();
                            intFloat++;
                        }
                    }, config.rtu.stateAgain);
                }
            }
            else {
                fn && fn({code: 1, msg: 'fails', data: 'none verified destination'});
            }
        }
    }
},
    /**
     * deprecated
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_lights_switch(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;
                    if (!data.switch) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', null]);
                    }
                    else {
                        if (data.switch === 'on') {
                            await engine.lightsOn();
                            await sleep(config.rtu.lightUp);
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'lightsOn']);
                        } else if (data.switch === 'off') {
                            await engine.lightsOff();
                            await sleep(config.rtu.lightUp);
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'lightsOff']);
                        } else {
                            ws_imgEngine.shuo = false;
                            fn([1, 'fails', 'no verified cmd']);
                        }
                    }
                }
            }
        );

    },
    /**
     * turn on the lights, handle left from ight
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_illums_switch(data, fn) {
        limitS(async () => {
            if (ws_imgEngine.shuo) {
                await sleep(3000);
                fn([1, 'waiting for last request to response', new Error()]);
            }
            else {
                // ws_imgEngine.shuo = true;
                if (!data.switch) {
                    ws_imgEngine.shuo = false;
                    fn([1, 'fails', null]);
                }
                else {
                    baseMethods.writeLog(`开灯==${data}`);
                    if (data.which === 'left') {
                        if (data.switch === 'on') {
                            await engine.relayOn(config.relay_illumi_left);
                            await sleep(config.rtu.lightUp);
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', {which: 'left', switch: 'on'}]);
                        }
                        else {
                            if (data.switch === 'off') {
                                await engine.relayOff(config.relay_illumi_left);
                                await sleep(config.rtu.lightUp);
                                ws_imgEngine.shuo = false;
                                fn([0, 'success', {which: 'left', switch: 'off'}]);
                            }
                        }
                    } else if (data.which === 'right') {
                        if (data.switch === 'on') {
                            await engine.relayOn(config.relay_illumi_right);
                            await sleep(config.rtu.lightUp);
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', {which: 'right', switch: 'on'}]);
                        }
                        else {
                            if (data.switch === 'off') {
                                await engine.relayOff(config.relay_illumi_right);
                                await sleep(config.rtu.lightUp);
                                ws_imgEngine.shuo = false;
                                fn([0, 'success', {which: 'right', switch: 'off'}]);
                            }
                        }
                    } else if (data.which === 'both') {
                        if (data.switch === 'on') {
                            const start = Date.now();
                            await engine.relayOn(config.relay_illumi_left);
                            // await sleep(config.rtu.lightUp);
                            await engine.relayOn(config.relay_illumi_right);
                            await sleep(config.rtu.lightUp);
                            baseMethods.writeLog(`开灯耗时==${Date.now() - start}==接收参数${data}`);
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', {which: 'both', switch: 'on'}]);
                        }
                        else {
                            if (data.switch === 'off') {
                                await engine.relayOff(config.relay_illumi_left);
                                // await sleep(config.rtu.lightUp);
                                await engine.relayOff(config.relay_illumi_right);
                                await sleep(config.rtu.lightUp);
                                ws_imgEngine.shuo = false;
                                fn([0, 'success', {which: 'both', switch: 'off'}]);
                            }
                        }
                    } else {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', 'no verified cmd']);
                    }
                }
            }
        });
    },
    /**
     * 开闭一体机
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_PC_switch(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;

                    if (!data.switch) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', null]);
                    }
                    else {
                        baseMethods.writeLog(`PC==${data}`);
                        if (data.switch === 'on') {
                            await engine.relayOff(config.relay_pc);
                            await sleep(config.rtu.lightUp);
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'pcOn']);
                        } else if (data.switch === 'off') {
                            await engine.relayOn(config.relay_pc);
                            await sleep(config.rtu.lightUp);
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'pcOff']);
                        } else {
                            ws_imgEngine.shuo = false;
                            fn([1, 'fails', 'no verified cmd']);
                        }
                    }
                }
            }
        );

    },
    /**
     * 重启继电器 路由器 串口服务器
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_relay_switch(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    if (!data.switch) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', null]);
                    }
                    else {
                        if (data.switch === 'on') {
                            await engine.relayOff(config.relay_power);
                            await sleep(config.rtu.lightUp);
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'relayOn']);
                        } else if (data.switch === 'off') {
                            await engine.relayOn(config.relay_power);
                            await sleep(config.rtu.lightUp * 5);
                            // await engine.relayOn(config.relay_rtu);
                            require('./core_ws');
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'relayOff']);
                        } else if (data.switch === 'restart') {
                            await engine.relayOn(config.relay_power);
                            await sleep(config.rtu.lightUp * 5);
                            // await engine.relayOn(config.relay_rtu);
                            // console.log('../../sPort/Engine_try');
                            // require('../../../sPort/Engine_try');
                            // require('../../../test');
                            // require('../../imgEngine_dieNo');
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'relayOff']);
                        } else {
                            ws_imgEngine.shuo = false;
                            fn([1, 'fails', 'no verified cmd']);
                        }
                    }
                }
            }
        );

    },
    /**
     * 开闭驱控器
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_engine_switch(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;
                    if (!data.switch) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', null]);
                    }
                    else {
                        if (data.switch === 'on') {
                            await engine.relayOn(config.relay_rtu);
                            await sleep(config.rtu.lightUp);
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'engineOn']);
                        } else if (data.switch === 'off') {
                            await engine.relayOff(config.relay_rtu);
                            await sleep(config.rtu.lightUp);
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'engineOff']);
                        } else {
                            ws_imgEngine.shuo = false;
                            fn([1, 'fails', 'no verified cmd']);
                        }
                    }
                }
            }
        );
    },
    /**
     * open garage
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_garage_open(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;

                    if (!data) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', null]);
                    }
                    else {
                        const re = await engine.garageOn();
                        if (re) {
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'garageOpen']);
                        } else {
                            ws_imgEngine.shuo = false;
                            fn([1, 'fails', 'fail to open garage']);
                        }
                    }
                }
            }
        );

    },
    /**
     * check the capacity of the garage
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_garage_check(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;
                    if (!data) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', null]);
                    }
                    else {
                        const relayStates = await engine.states('relay', 0);
                        if (relayStates[config.garage_full - 1]) {
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'full']);
                        } else {
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', 'available']);
                        }
                    }
                }
            }
        );
    },
    /**
     * waiting for garage lock
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_garage_lock_wait(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;
                    // 描述：等待抽屉关闭
                    // time	number类型	等待门关闭的时间，感应门关闭直接返回，超出 time 时间，报错
                    console.log('F_garage_lock_check');
                    // console.log(data.time);
                    if (!data.time) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', null]);
                    }
                    else {
                        if (data.time === config.rtu.stateAgain) {
                            data.time += 200;
                        }
                        await sleep(100);
                        const garage = await lockCheck('garage');
                        if (garage.garageLock) {
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', {closed: true}]);
                        } else {
                            let intval = null;
                            const tout = setTimeout(async () => {
                                clearTimeout(tout);
                                clearInterval(intval);
                                const garage = await lockCheck('garage');
                                if (garage.garageLock) {
                                    ws_imgEngine.shuo = false;
                                    fn([0, 'success', {closed: true}])
                                } else {
                                    ws_imgEngine.shuo = false;
                                    fn([0, 'success', {closed: false}]);
                                    // throw Error;
                                }
                            }, data.time);
                            intval = setInterval(async () => {
                                const garage = await lockCheck('garage');
                                if (garage.garageLock) {
                                    clearTimeout(tout);
                                    clearInterval(intval);
                                    ws_imgEngine.shuo = false;
                                    fn([0, 'success', {closed: true}]);
                                }
                            }, config.rtu.stateAgain)
                        }
                    }
                }
            }
        );
    },
    /**
     * waiting for drawer lock
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async F_drawer_lock_wait(data, fn) {
        limitS(async () => {
                if (ws_imgEngine.shuo) {
                    await sleep(3000);
                    fn([1, 'waiting for last request to response', new Error()]);
                }
                else {
                    // ws_imgEngine.shuo = true;
                    if (!data) {
                        ws_imgEngine.shuo = false;
                        fn([1, 'fails', null]);
                    }
                    else {
                        if (data.time === config.rtu.stateAgain) {
                            data.time += 200;
                        }
                        await sleep(100);
                        const drawer = await lockCheck('drawer');
                        if (drawer && drawer.drawerLock) {
                            ws_imgEngine.shuo = false;
                            fn([0, 'success', {closed: true}]);
                        } else {
                            let intval = null;
                            const tout = setTimeout(async () => {
                                clearTimeout(tout);
                                clearInterval(intval);
                                const drawer = await lockCheck('drawer');
                                if (drawer && drawer.drawerLock) {
                                    ws_imgEngine.shuo = false;
                                    fn([0, 'success', {closed: true}]);
                                } else {
                                    ws_imgEngine.shuo = false;
                                    fn([0, 'success', {closed: false}]);
                                    // throw Error;
                                }
                            }, data.time);
                            intval = setInterval(async () => {
                                const drawer = await lockCheck('drawer');
                                if (drawer && drawer.drawerLock) {
                                    clearTimeout(tout);
                                    clearInterval(intval);
                                    ws_imgEngine.shuo = false;
                                    fn([0, 'success', {closed: true}]);
                                }
                            }, config.rtu.stateAgain)
                        }
                    }
                }
            }
        );
    },
    async engineSleepZero(fn) {
        engineSleepy = 0;
        engineOff = 0;
        fn(engineSleepy);
    },
};

let engineSleepy = 0;
let engineOff = 0;
setInterval(async () => {
    // console.log('engineSleepy', engineSleepy);
    if (engineSleepy > config.rtu.engineOffGap && engineOff === 0) {
        // console.log('again');
        baseMethods.writeLog(`time out ${engineSleepy},engineSleepy. engineOff =${engineOff}`);
        // console.log('engineOff', engineOff)
        engineOff++;
        engineSleepy = 0;
        await motorOff();
    } else {

    }
    engineSleepy++;
}, 1000);
const engineSleepZero = async () => {
    engineSleepy = 0;
    engineOff = 0;
    return engineSleepy;
};
