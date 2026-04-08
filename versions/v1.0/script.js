// 音效系统 - 使用 Web Audio API
const AudioSys = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    // 播放种植音效（短促上升音）
    playPlant() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.1);
    },
    // 播放收获音效（欢快双音）
    playHarvest() {
        this.init();
        [523.25, 659.25].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.1 + 0.2);
            osc.start(this.ctx.currentTime + i * 0.1);
            osc.stop(this.ctx.currentTime + i * 0.1 + 0.2);
        });
    },
    // 播放打开面板音效（轻微叮声）
    playOpen() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.08);
    },
    // 播放金币音效（高频叮）
    playCoin() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = 1200;
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.15);
    },
    // 播放错误/失败音效（低沉）
    playError() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = 200;
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.2);
    }
};

// 8种作物数据
const CROPS = {
    "葱": {
        name: "葱",
        icon: "🌱",
        growTime: 30,        // 30秒成熟
        seedPrice: 10,       // 种子价格
        sellPrice: 15,       // 收获售价
        stages: ["🌱", "🌿", "🌾"]  // 生长阶段图标
    },
    "白菜": {
        name: "白菜",
        icon: "🥬",
        growTime: 60,
        seedPrice: 20,
        sellPrice: 35,
        stages: ["🌱", "🥬", "🥬"]
    },
    "土豆": {
        name: "土豆",
        icon: "🥔",
        growTime: 120,
        seedPrice: 30,
        sellPrice: 55,
        stages: ["🌱", "🌿", "🥔"]
    },
    "西红柿": {
        name: "西红柿",
        icon: "🍅",
        growTime: 180,
        seedPrice: 50,
        sellPrice: 90,
        stages: ["🌱", "🍃", "🍅"]
    },
    "洋葱": {
        name: "洋葱",
        icon: "🧅",
        growTime: 240,
        seedPrice: 60,
        sellPrice: 110,
        stages: ["🌱", "🌿", "🧅"]
    },
    "辣椒": {
        name: "辣椒",
        icon: "🌶️",
        growTime: 300,
        seedPrice: 80,
        sellPrice: 140,
        stages: ["🌱", "🌿", "🌶️"]
    },
    "萝卜": {
        name: "萝卜",
        icon: "🥕",
        growTime: 180,
        seedPrice: 40,
        sellPrice: 75,
        stages: ["🌱", "🌿", "🥕"]
    },
    "折耳根": {
        name: "折耳根",
        icon: "🌿",
        growTime: 600,       // 10分钟，贵州特色
        seedPrice: 100,
        sellPrice: 200,
        stages: ["🌱", "🌿", "🌿"]
    }
};

// 游戏数据
let game = {
    coins: 100,
    plots: Array(32).fill(null), // 32个地块（4层×8个）
    inventory: {} // 种子库存
};

// 初始化
console.log("作物数据加载完成:", Object.keys(CROPS));

// 存档系统
function saveGame() {
    localStorage.setItem('farm_save', JSON.stringify(game));
    console.log('游戏已保存');
}

function loadGame() {
    const save = localStorage.getItem('farm_save');
    if (save) {
        game = JSON.parse(save);
        console.log('游戏已加载');
        restorePlots();
    }
}

function restorePlots() {
    // 恢复所有地块的视觉状态
    game.plots.forEach((plotData, index) => {
        if (plotData) {
            const plotEl = plots[index];
            const crop = CROPS[plotData.cropType];

            // 计算当前阶段
            const now = Date.now() / 1000;
            const elapsed = now - plotData.plantedAt;
            const progress = elapsed / crop.growTime;

            if (progress >= 1) {
                plotData.stage = 2;
                plotEl.textContent = crop.stages[2];
                plotEl.style.borderColor = '#4CAF50';
            } else if (progress >= 0.5) {
                plotData.stage = 1;
                plotEl.textContent = crop.stages[1];
            } else {
                plotData.stage = 0;
                plotEl.textContent = crop.stages[0];
            }

            // 继续生长
            startGrowth(index, plotEl);
        }
    });
    updateCoins();
}

// 获取DOM元素
const plots = document.querySelectorAll('.plot');
const shopCoinsEl = document.getElementById('shop-coins');
const shopBtn = document.getElementById('shop-btn');
const shopPanel = document.getElementById('shop-panel');
const closeShopBtn = document.getElementById('close-shop');

// 点击地块 - 播种或收获
plots.forEach(plot => {
    plot.addEventListener('click', () => {
        const index = parseInt(plot.dataset.index);
        const plotData = game.plots[index];

        if (!plotData) {
            // 空地，打开仓库选择种子种植
            openWarehouseToPlant(index);
        } else if (plotData.stage === 2) {
            // 已成熟，收获
            harvestCrop(index, plot);
        } else {
            // 生长中
            showAlert(`作物生长中，请稍后再来`);
        }
    });
});

// 打开仓库进行种植
function openWarehouseToPlant(plotIndex) {
    // 检查仓库是否为空
    const hasSeeds = Object.values(game.inventory).some(count => count > 0);
    if (!hasSeeds) {
        showAlert('仓库为空，先去商店购买种子吧！');
        return;
    }

    // 记录要种植的地块
    warehousePanel.dataset.plot = plotIndex;

    // 渲染仓库（种植模式）
    renderWarehouse();

    // 打开仓库面板
    warehousePanel.classList.remove('hidden');
}

// 从仓库种植
function plantFromWarehouse(cropName) {
    const plotIndex = parseInt(warehousePanel.dataset.plot);
    const plotEl = plots[plotIndex];

    // 检查种子数量
    if (!game.inventory[cropName] || game.inventory[cropName] <= 0) {
        showAlert('种子数量不足！');
        return;
    }

    // 消耗种子
    game.inventory[cropName]--;

    // 种植
    game.plots[plotIndex] = {
        cropType: cropName,
        plantedAt: Date.now() / 1000,
        stage: 0
    };

    // 显示作物图标
    const crop = CROPS[cropName];
    plotEl.textContent = crop.stages[0];

    // 播放种植音效
    AudioSys.playPlant();

    // 开始生长
    startGrowth(plotIndex, plotEl);

    // 关闭仓库面板
    warehousePanel.classList.add('hidden');
    warehousePanel.dataset.plot = '';

    // 保存游戏
    saveGame();

    console.log(`种植了 ${cropName}，剩余：${game.inventory[cropName]}`);
}

// 更新银币显示（在商店中）
function updateCoins() {
    if (shopCoinsEl) {
        shopCoinsEl.textContent = game.coins;
    }
}

// 生长系统
function startGrowth(index, plotEl) {
    const plotData = game.plots[index];
    const crop = CROPS[plotData.cropType];

    // 定时检查生长进度
    const timer = setInterval(() => {
        const now = Date.now() / 1000;
        const elapsed = now - plotData.plantedAt;
        const progress = elapsed / crop.growTime;
        const remaining = Math.ceil(crop.growTime - elapsed);

        // 更新阶段
        if (progress >= 1) {
            // 成熟 - 清除倒计时标签
            plotData.stage = 2;
            plotEl.textContent = crop.stages[2];
            clearInterval(timer);
        } else if (progress >= 0.5 && plotData.stage < 1) {
            // 中期 - 更新图标但保留倒计时
            plotData.stage = 1;
            plotEl.textContent = crop.stages[1];
            addTimerToPlot(plotEl, remaining, crop.name);
        } else {
            // 生长中 - 更新倒计时
            addTimerToPlot(plotEl, remaining, crop.name);
        }
    }, 1000); // 每秒检查一次

    // 立即显示一次倒计时
    const remaining = Math.ceil(crop.growTime - (Date.now() / 1000 - plotData.plantedAt));
    addTimerToPlot(plotEl, remaining, crop.name);
}

// 辅助函数：添加或更新倒计时标签和作物名称
function addTimerToPlot(plotEl, seconds, cropName) {
    // 倒计时标签
    let timerEl = plotEl.querySelector('.growth-timer');
    if (!timerEl) {
        timerEl = document.createElement('span');
        timerEl.className = 'growth-timer';
        plotEl.appendChild(timerEl);
    }
    timerEl.textContent = seconds + 's';

    // 作物名称标签
    let nameEl = plotEl.querySelector('.crop-name-label');
    if (!nameEl) {
        nameEl = document.createElement('span');
        nameEl.className = 'crop-name-label';
        plotEl.appendChild(nameEl);
    }
    nameEl.textContent = cropName;
}

// 收获功能
function harvestCrop(index, plotEl) {
    const plotData = game.plots[index];
    const crop = CROPS[plotData.cropType];

    // 获得银币
    game.coins += crop.sellPrice;
    updateCoins();

    // 清空地块
    game.plots[index] = null;
    plotEl.textContent = '';

    showAlert(`收获了 ${crop.name} ${crop.icon}，获得 ${crop.sellPrice} 银币！`, '🎉 收获');

    // 播放收获音效
    AudioSys.playHarvest();

    // 保存游戏
    saveGame();
}
const shovel = document.getElementById('shovel');
const farm = document.getElementById('farm');

// 鼠标移动时更新铲子位置
document.addEventListener('mousemove', (e) => {
    shovel.style.left = (e.clientX + 10) + 'px';  // 偏移一点，不挡光标
    shovel.style.top = (e.clientY - 10) + 'px';
});

// 进入农场区域显示铲子
farm.addEventListener('mouseenter', () => {
    shovel.style.display = 'block';
});

// 离开农场区域隐藏铲子
farm.addEventListener('mouseleave', () => {
    shovel.style.display = 'none';
});

// 地块hover时检查是否已种植
document.querySelectorAll('.plot').forEach(plot => {
    plot.addEventListener('mouseenter', () => {
        if (plot.classList.contains('planted')) {
            shovel.style.display = 'none';  // 已种植，不显示铲子
        } else {
            shovel.style.display = 'block';
            shovel.textContent = '🪏';  // 未种植，显示铲子
        }
    });

    plot.addEventListener('mouseleave', () => {
        shovel.style.display = 'block';  // 恢复显示（如果在农场内）
    });
});
// 仓库相关元素
const warehouseBtn = document.getElementById('warehouse-btn');
const warehousePanel = document.getElementById('warehouse-panel');
const closeWarehouseBtn = document.getElementById('close-warehouse');
const warehouseList = document.getElementById('warehouse-list');
const warehouseEmpty = document.getElementById('warehouse-empty');

// 仓库按钮
warehouseBtn.addEventListener('click', () => {
    warehousePanel.dataset.plot = ''; // 清除种植模式
    renderWarehouse();
    warehousePanel.classList.remove('hidden');
    AudioSys.playOpen();
});

closeWarehouseBtn.addEventListener('click', () => {
    warehousePanel.classList.add('hidden');
    warehousePanel.dataset.plot = '';
});

// 渲染仓库
function renderWarehouse() {
    warehouseList.innerHTML = '';

    const isPlantMode = warehousePanel.dataset.plot !== '';
    let hasSeeds = false;

    Object.keys(game.inventory).forEach(cropName => {
        const count = game.inventory[cropName];
        if (count > 0) {
            hasSeeds = true;
            const crop = CROPS[cropName];

            const item = document.createElement('div');
            item.className = 'warehouse-item';
            item.innerHTML = `
                <div class="warehouse-seed-icon">🫘</div>
                <div class="warehouse-seed-info">
                    <div class="warehouse-seed-name">${crop.name}</div>
                    <div class="warehouse-seed-count">x${count}</div>
                </div>
            `;

            // 种植模式下，点击种子进行种植
            if (isPlantMode) {
                item.addEventListener('click', () => plantFromWarehouse(cropName));
            }

            warehouseList.appendChild(item);
        }
    });

    // 显示或隐藏空仓库提示
    if (hasSeeds) {
        warehouseEmpty.classList.add('hidden');
        warehouseList.classList.remove('hidden');
    } else {
        warehouseEmpty.classList.remove('hidden');
        warehouseList.classList.add('hidden');
    }
}

// 商店按钮
shopBtn.addEventListener('click', () => {
    generateShop(); // 每次打开时重新生成
    shopPanel.classList.remove('hidden');
    AudioSys.playOpen();
});

closeShopBtn.addEventListener('click', () => {
    shopPanel.classList.add('hidden');
});

// 页面加载完成后初始化
function init() {
    console.log('初始化游戏...');
    loadGame();
    generateShop();

    // 检查是否已开始游戏（点击过开始游戏按钮但未结束）
    const hasStarted = localStorage.getItem('farm_started');
    if (hasStarted === 'true') {
        // 已开始过，直接进入游戏主界面
        startScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        console.log('继续上次的游戏');
    }

    console.log('初始化完成');
}

// 如果 DOM 已加载，直接执行；否则等 DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 每10秒自动保存
setInterval(saveGame, 10000);

function generateShop() {
    console.log('生成商店...');
    const shopList = document.getElementById('shop-list');
    if (!shopList) {
        console.error('找不到 shop-list 元素!');
        return;
    }
    shopList.innerHTML = '';

    const cropNames = Object.keys(CROPS);
    const itemsPerShelf = 3; // 每层3个
    let currentRow = null;

    cropNames.forEach((cropName, index) => {
        // 每3个创建一个新货架层
        if (index % itemsPerShelf === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'shelf-row';
            shopList.appendChild(currentRow);
        }

        const crop = CROPS[cropName];
        const seedItem = document.createElement('div');
        seedItem.className = 'seed-item';
        seedItem.innerHTML = `
            <div class="seed-icon">🫘</div>
            <div class="seed-name">${crop.name}</div>
            <div class="seed-price">${crop.seedPrice}🪙</div>
        `;

        seedItem.addEventListener('click', () => buySeed(cropName, seedItem));
        currentRow.appendChild(seedItem);
    });

    // 最后一行如果不足3个，补充空白占位
    if (currentRow && currentRow.children.length < itemsPerShelf) {
        const emptySlots = itemsPerShelf - currentRow.children.length;
        for (let i = 0; i < emptySlots; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.style.width = '80px';
            currentRow.appendChild(emptySlot);
        }
    }
}

// 自定义确认弹窗
const confirmModal = document.getElementById('confirm-modal');
const confirmText = document.getElementById('confirm-text');
const confirmOk = document.getElementById('confirm-ok');
const confirmCancel = document.getElementById('confirm-cancel');

let confirmCallback = null;

function showConfirm(text, onConfirm) {
    confirmText.textContent = text;
    confirmCallback = onConfirm;
    confirmModal.classList.remove('hidden');
}

confirmOk.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
    if (confirmCallback) {
        confirmCallback(true);
        confirmCallback = null;
    }
});

confirmCancel.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
    if (confirmCallback) {
        confirmCallback(false);
        confirmCallback = null;
    }
});

// 消息提示弹窗
const alertModal = document.getElementById('alert-modal');
const alertText = document.getElementById('alert-text');
const alertTitle = document.getElementById('alert-title');
const alertOk = document.getElementById('alert-ok');

let alertCallback = null;

function showAlert(text, title = '💡 提示') {
    alertText.textContent = text;
    alertTitle.textContent = title;
    alertModal.classList.remove('hidden');
}

alertOk.addEventListener('click', () => {
    alertModal.classList.add('hidden');
    if (alertCallback) {
        alertCallback();
        alertCallback = null;
    }
});

function buySeed(cropName, seedItemEl) {
    const crop = CROPS[cropName];

    // 检查银币
    if (game.coins < crop.seedPrice) {
        showAlert('银币不足！');
        AudioSys.playError();
        return;
    }

    // 显示自定义确认弹窗
    showConfirm(`确认购买 ${crop.name} 种子？\n价格：${crop.seedPrice}🪙`, (confirmed) => {
        if (!confirmed) {
            return;
        }

        // 扣除银币
        game.coins -= crop.seedPrice;
        updateCoins();

        // 添加种子到仓库
        if (!game.inventory[cropName]) {
            game.inventory[cropName] = 0;
        }
        game.inventory[cropName]++;

        // 显示购买成功
        seedItemEl.style.transform = 'scale(0.95)';
        setTimeout(() => {
            seedItemEl.style.transform = '';
        }, 150);

        // 播放金币音效
        AudioSys.playCoin();

        console.log(`购买了 ${cropName} 种子，库存：${game.inventory[cropName]}`);

        // 保存游戏
        saveGame();
    });
}

// 启动页和视频播放逻辑
const startScreen = document.getElementById('start-screen');
const startGameBtn = document.getElementById('start-game-btn');
const videoLayer = document.getElementById('video-layer');
const introVideo = document.getElementById('intro-video');
const gameContainer = document.getElementById('game-container');

startGameBtn.addEventListener('click', () => {
    // 标记游戏已开始
    localStorage.setItem('farm_started', 'true');

    // 隐藏启动页
    startScreen.classList.add('hidden');

    // 显示视频层
    videoLayer.classList.remove('hidden');

    // 播放视频
    introVideo.play().catch(err => {
        console.log('视频播放失败:', err);
        // 如果视频播放失败，直接进入游戏
        videoLayer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
    });
});

// 视频播放结束后进入游戏
introVideo.addEventListener('ended', () => {
    videoLayer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
});

// 结束游戏逻辑
const exitBtn = document.getElementById('exit-btn');
const outroLayer = document.getElementById('outro-layer');
const outroVideo = document.getElementById('outro-video');

exitBtn.addEventListener('click', () => {
    // 显示确认弹窗
    showConfirm('确定要结束游戏吗？\n（记得先保存哦）', (confirmed) => {
        if (!confirmed) return;

        // 保存游戏
        saveGame();

        // 隐藏游戏主界面
        gameContainer.classList.add('hidden');

        // 显示结束动画层
        outroLayer.classList.remove('hidden');

        // 播放结束动画
        outroVideo.play().catch(err => {
            console.log('结束动画播放失败:', err);
            // 如果动画播放失败，清除标记并直接回到启动页
            localStorage.removeItem('farm_started');
            outroLayer.classList.add('hidden');
            startScreen.classList.remove('hidden');
        });
    });
});

// 结束动画播放结束后回到启动页
outroVideo.addEventListener('ended', () => {
    // 清除游戏已开始标记，下次刷新会显示启动页
    localStorage.removeItem('farm_started');

    outroLayer.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

