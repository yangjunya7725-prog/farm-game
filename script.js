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

// 当前玩家 (1 或 2)
let currentPlayer = null;

// 8种作物数据 - 调整后的种子价格
const CROPS = {
    "葱": {
        name: "葱",
        icon: "🌱",
        growTime: 30,
        seedPrice: 8,
        stages: ["🌱", "🌿", "🌾"]
    },
    "白菜": {
        name: "白菜",
        icon: "🥬",
        growTime: 60,
        seedPrice: 15,
        stages: ["🌱", "🥬", "🥬"]
    },
    "土豆": {
        name: "土豆",
        icon: "🥔",
        growTime: 120,
        seedPrice: 25,
        stages: ["🌱", "🌿", "🥔"]
    },
    "西红柿": {
        name: "西红柿",
        icon: "🍅",
        growTime: 180,
        seedPrice: 40,
        stages: ["🌱", "🍃", "🍅"]
    },
    "洋葱": {
        name: "洋葱",
        icon: "🧅",
        growTime: 240,
        seedPrice: 50,
        stages: ["🌱", "🌿", "🧅"]
    },
    "辣椒": {
        name: "辣椒",
        icon: "🌶️",
        growTime: 300,
        seedPrice: 70,
        stages: ["🌱", "🌿", "🌶️"]
    },
    "萝卜": {
        name: "萝卜",
        icon: "🥕",
        growTime: 180,
        seedPrice: 35,
        stages: ["🌱", "🌿", "🥕"]
    },
    "折耳根": {
        name: "折耳根",
        icon: "🌿",
        growTime: 600,
        seedPrice: 120,
        stages: ["🌱", "🌿", "🌿"]
    }
};

// 可解锁的新作物（需要花费银币解锁后才能购买种子）
// 稀有度：★☆☆=普通 ★★☆=稀有 ★★★=珍贵
const LOCKED_CROPS = {
    "包谷": {
        name: "包谷",
        icon: "🌽",
        growTime: 200,
        seedPrice: 30,
        stages: ["🌱", "🌽", "🌽"],
        unlockPrice: 200,
        rarity: 1
    },
    "大蒜": {
        name: "大蒜",
        icon: "🧄",
        growTime: 150,
        seedPrice: 20,
        stages: ["🌱", "🌿", "🧄"],
        unlockPrice: 250,
        rarity: 1
    },
    "地豆": {
        name: "地豆",
        icon: "🥜",
        growTime: 250,
        seedPrice: 35,
        stages: ["🌱", "🌿", "🥜"],
        unlockPrice: 280,
        rarity: 1
    },
    "遵义姜": {
        name: "遵义姜",
        icon: "🫚",
        growTime: 280,
        seedPrice: 45,
        stages: ["🌱", "🌿", "🫚"],
        unlockPrice: 350,
        rarity: 2
    },
    "豌豆": {
        name: "豌豆",
        icon: "🫛",
        growTime: 180,
        seedPrice: 32,
        stages: ["🌱", "🫛", "🫛"],
        unlockPrice: 380,
        rarity: 2
    },
    "黄瓜": {
        name: "黄瓜",
        icon: "🥒",
        growTime: 220,
        seedPrice: 42,
        stages: ["🌱", "🌿", "🥒"],
        unlockPrice: 400,
        rarity: 2
    },
    "茄子": {
        name: "茄子",
        icon: "🍆",
        growTime: 260,
        seedPrice: 48,
        stages: ["🌱", "🌿", "🍆"],
        unlockPrice: 450,
        rarity: 2
    },
    "灯笼椒": {
        name: "灯笼椒",
        icon: "🫑",
        growTime: 240,
        seedPrice: 46,
        stages: ["🌱", "🌿", "🫑"],
        unlockPrice: 480,
        rarity: 2
    },
    "西兰花": {
        name: "西兰花",
        icon: "🥦",
        growTime: 320,
        seedPrice: 60,
        stages: ["🌱", "🥦", "🥦"],
        unlockPrice: 600,
        rarity: 3
    },
    "菌子": {
        name: "菌子",
        icon: "🍄",
        growTime: 400,
        seedPrice: 80,
        stages: ["🌱", "🍄", "🍄"],
        unlockPrice: 800,
        rarity: 3
    }
};

// 加工菜谱数据
// 价格设计原则：
// - 基础价 = 原材料成本 × 1.05 （5%毛利，覆盖加工成本）
// - 订单奖励 = 基础价 × 1.1~1.25 = 成本 × 1.15~1.31 （15-31%净利润）
const RECIPES = {
    "薯片": {
        name: "薯片",
        icon: "🥔",
        productImage: "product-shupian.png",
        ingredients: { "土豆": 2, "盐": 1 },
        processTime: 10,
        // 成本：25×2 + 5 = 55，基础价：58，订单：64~72（利润9~17，16-31%）
        basePrice: 58
    },
    "辣椒酱": {
        name: "辣椒酱",
        icon: "🌶️",
        productImage: "product-lajiaojiang.png",
        ingredients: { "辣椒": 3, "盐": 1, "西红柿": 1 },
        processTime: 20,
        // 成本：70×3 + 5 + 40 = 255，基础价：268，订单：295~335（利润40~80，16-31%）
        basePrice: 268
    },
    "腌白菜": {
        name: "腌白菜",
        icon: "🥬",
        productImage: "product-yanbaicai.png",
        ingredients: { "白菜": 2, "盐": 1, "辣椒": 1 },
        processTime: 30,
        // 成本：15×2 + 5 + 70 = 105，基础价：110，订单：121~138（利润16~33，15-31%）
        basePrice: 110
    },
    "葱油": {
        name: "葱油",
        icon: "🧴",
        productImage: "product-congyou.png",
        ingredients: { "葱": 3, "洋葱": 1 },
        processTime: 15,
        // 成本：8×3 + 50 = 74，基础价：78，订单：86~98（利润12~24，16-32%）
        basePrice: 78
    },
    "萝卜干": {
        name: "萝卜干",
        icon: "🥕",
        productImage: "product-luobogan.png",
        ingredients: { "萝卜": 2, "盐": 1 },
        processTime: 25,
        // 成本：35×2 + 5 = 75，基础价：79，订单：87~99（利润12~24，16-32%）
        basePrice: 79
    },
    "凉拌折耳根": {
        name: "凉拌折耳根",
        icon: "🌿",
        productImage: "product-liangbanzheer.png",
        ingredients: { "折耳根": 2, "辣椒": 1, "盐": 1 },
        processTime: 5,
        // 成本：120×2 + 70 + 5 = 315，基础价：331，订单：364~414（利润49~99，16-31%）
        basePrice: 331
    },
    "番茄酱": {
        name: "番茄酱",
        icon: "🥫",
        productImage: "product-fanqiejiang.png",
        ingredients: { "西红柿": 3, "盐": 1, "糖": 1 },
        processTime: 25,
        // 成本：40×3 + 5 + 8 = 133，基础价：140，订单：154~175（利润21~42，16-32%）
        basePrice: 140
    },
    // 高级菜谱（需解锁所有蔬菜后自动解锁）
    "老醋花生": {
        name: "老醋花生",
        icon: "🥜",
        productImage: "product-laocu.png",
        ingredients: { "地豆": 2, "陈醋": 1, "遵义姜": 1 },
        processTime: 15,
        locked: true,
        basePrice: 75
    },
    "花生糖": {
        name: "花生糖",
        icon: "🍬",
        productImage: "product-huashengtang.png",
        ingredients: { "地豆": 2, "糖": 2 },
        processTime: 20,
        locked: true,
        basePrice: 68
    },
    "玉米烙": {
        name: "玉米烙",
        icon: "🌽",
        productImage: "product-yumilao.png",
        ingredients: { "包谷": 2, "糖": 1 },
        processTime: 25,
        locked: true,
        basePrice: 55
    },
    "豌豆凉粉": {
        name: "豌豆凉粉",
        icon: "🫛",
        productImage: "product-wandouliang.png",
        ingredients: { "豌豆": 3, "盐": 1, "遵义姜": 1, "辣椒": 1, "陈醋": 1 },
        processTime: 30,
        locked: true,
        basePrice: 95
    },
    "豌豆黄": {
        name: "豌豆黄",
        icon: "🟨",
        productImage: "product-wandouhuang.png",
        ingredients: { "豌豆": 2, "糖": 2 },
        processTime: 25,
        locked: true,
        basePrice: 60
    },
    "酱黄瓜": {
        name: "酱黄瓜",
        icon: "🥒",
        productImage: "product-jianghuanggua.png",
        ingredients: { "黄瓜": 2, "酱油": 1, "盐": 1, "糖": 1, "大蒜": 1 },
        processTime: 20,
        locked: true,
        basePrice: 72
    },
    "虎皮青椒": {
        name: "虎皮青椒",
        icon: "🫑",
        productImage: "product-hupiqingjiao.png",
        ingredients: { "灯笼椒": 3, "大蒜": 1, "豆瓣酱": 1, "糖": 1 },
        processTime: 20,
        locked: true,
        basePrice: 85
    },
    "菌油": {
        name: "菌油",
        icon: "🍄",
        productImage: "product-junyou.png",
        ingredients: { "菌子": 3, "葱": 1, "大蒜": 1 },
        processTime: 35,
        locked: true,
        basePrice: 115
    },
    "干煸菌子": {
        name: "干煸菌子",
        icon: "🍄",
        productImage: "product-ganbianjun.png",
        ingredients: { "菌子": 2, "辣椒": 2, "大蒜": 1, "干辣椒面": 1, "花椒": 1 },
        processTime: 30,
        locked: true,
        basePrice: 108
    },
    "鱼香茄子": {
        name: "鱼香茄子",
        icon: "🍆",
        productImage: "product-yuxiangqiezi.png",
        ingredients: { "茄子": 2, "灯笼椒": 1, "遵义姜": 1, "大蒜": 1, "酱油": 1, "陈醋": 1, "糖": 1 },
        processTime: 25,
        locked: true,
        basePrice: 98
    }
};

// 调味料（基础材料，可通过订单奖励或商店购买获得）
const SEASONINGS = {
    "盐": { name: "盐", icon: "🧂", buyPrice: 5 },
    "糖": { name: "糖", icon: "🍬", buyPrice: 8 },
    "陈醋": { name: "陈醋", icon: "🍾", buyPrice: 12 },
    "酱油": { name: "酱油", icon: "🍶", buyPrice: 15 },
    "干辣椒面": { name: "干辣椒面", icon: "🌶️", buyPrice: 10 },
    "豆瓣酱": { name: "豆瓣酱", icon: "🫘", buyPrice: 18 },
    "花椒": { name: "花椒", icon: "🟤", buyPrice: 20 },
    "料酒": { name: "料酒", icon: "🍷", buyPrice: 15 }
};

// NPC 发布者数据
const NPCS = [
    {
        name: "食堂王阿姨",
        icon: "👩‍🍳",
        greeting: "老板，这批货急用啊！",
        dialogues: [
            "老板，听说你这儿的货不错啊！",
            "我是食堂的王阿姨，每天要供应几百号人吃饭。",
            "这批食材赶着用，能给我做吗？",
            "急用，价格好说！"
        ]
    },
    {
        name: "超市采购李哥",
        icon: "👨‍💼",
        greeting: "有现货吗？价格好商量。",
        dialogues: [
            "哟，老板在呢！",
            "我是超市的李哥，专门负责采购的。",
            "你这东西质量还行，给我来一批。",
            "咱们长期合作，这次价格给优惠点？"
        ]
    },
    {
        name: "餐厅主厨陈师傅",
        icon: "👨‍🍳",
        greeting: "我要最好的食材。",
        dialogues: [
            "嗯，听说你这里有新鲜货。",
            "我是陈师傅，对食材要求很高的。",
            "做不好菜，砸的是我的招牌。",
            "这单给我用心做，钱不是问题。"
        ]
    },
    {
        name: "老街坊张奶奶",
        icon: "👵",
        greeting: "给我来点儿家常味道。",
        dialogues: [
            "孩子，奶奶来看看你。",
            "咱们老街坊了，你家东西我信得过。",
            "孙子孙女要回来，想给他们做点好吃的。",
            "不急，你慢慢给我准备。"
        ]
    },
    {
        name: "民宿老板小刘",
        icon: "👱",
        greeting: "客人等着用呢，快点哈。",
        dialogues: [
            "嗨，忙着呢？",
            "我是山脚民宿的小刘，客人贼多。",
            "有个团要来，急需一批土特产。",
            "江湖救急啊兄弟！"
        ]
    }
];

// 订单系统 - 新机制：对话接单 + 30分钟冷却
const ORDER_SYSTEM = {
    orders: [],
    nextOrderTime: 0, // 下次可接订单的时间戳
    cooldownMinutes: 30, // 冷却时间（分钟）
    pendingNPC: null, // 等待对话的NPC
    pendingOrder: null, // 等待接单的订单

    // 生成随机订单
    generateOrder() {
        const recipeNames = Object.keys(RECIPES);
        // 过滤掉锁定的菜谱
        const availableRecipes = recipeNames.filter(name => {
            const recipe = RECIPES[name];
            return !recipe.locked || game.unlockedRecipes.includes(name);
        });
        const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
        const recipe = RECIPES[randomRecipe];
        const npc = NPCS[Math.floor(Math.random() * NPCS.length)];

        // 数量 1-3 随机
        const quantity = Math.floor(Math.random() * 3) + 1;

        // 奖励 = 基础价格 × 数量 × 1.1 ~ 1.25 倍，合理利润 15-30%
        const bonusMultiplier = 1.1 + Math.random() * 0.15;
        const reward = Math.floor(recipe.basePrice * quantity * bonusMultiplier);

        return {
            id: Date.now() + Math.random(),
            productName: randomRecipe,
            productIcon: recipe.icon,
            quantity: quantity,
            reward: reward,
            npc: npc,
            createdAt: Date.now()
        };
    },

    // 初始化订单
    initOrders() {
        // 根据当前玩家加载订单数据
        const ordersKey = currentPlayer ? `farm_orders_player${currentPlayer}` : 'farm_orders_v2';
        const timeKey = currentPlayer ? `farm_order_next_time_player${currentPlayer}` : 'farm_order_next_time';
        
        const savedOrders = localStorage.getItem(ordersKey);
        const savedTime = localStorage.getItem(timeKey);

        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        } else {
            this.orders = []; // 新玩家没有订单
        }
        if (savedTime) {
            this.nextOrderTime = parseInt(savedTime);
        } else {
            this.nextOrderTime = 0; // 新玩家可以立即接订单
        }

        // 检查是否可以生成新订单
        this.checkNewOrderAvailable();
    },

    // 检查是否可以生成新订单
    checkNewOrderAvailable() {
        const now = Date.now();
        if (this.orders.length === 0 && now >= this.nextOrderTime) {
            // 可以生成新订单，显示提示
            this.showOrderNotification();
        }
    },

    // 显示订单提示
    showOrderNotification() {
        // 如果已经在对话中，不显示
        if (this.pendingNPC) return;

        // 检查玩家是否从来没有完成过订单（新玩家第一份订单给薯片）
        const hasCompletedAnyOrder = localStorage.getItem(`farm_order_completed_${currentPlayer}`);
        const isFirstOrder = !hasCompletedAnyOrder && this.orders.length === 0;
        
        // 生成待接订单
        if (isFirstOrder) {
            // 第一份订单固定为薯片
            const recipe = RECIPES["薯片"];
            const npc = NPCS[Math.floor(Math.random() * NPCS.length)];
            this.pendingOrder = {
                id: Date.now() + Math.random(),
                productName: "薯片",
                productIcon: recipe.icon,
                quantity: 1,
                reward: Math.floor(recipe.basePrice * 1.15), // 固定1.15倍奖励
                npc: npc,
                createdAt: Date.now()
            };
        } else {
            this.pendingOrder = this.generateOrder();
        }
        this.pendingNPC = this.pendingOrder.npc;

        // 显示通知按钮
        showOrderNotificationButton(this.pendingNPC);
    },

    // 开始对话
    startDialogue() {
        if (!this.pendingNPC || !this.pendingOrder) return;

        const npc = this.pendingNPC;
        const order = this.pendingOrder;
        const dialogues = npc.dialogues || [];

        // 隐藏通知按钮
        hideOrderNotificationButton();

        // 开始对话流程
        showNPCDialogue(npc, dialogues, order);
    },

    // 接受订单
    acceptOrder() {
        if (!this.pendingOrder) return;

        // 添加到订单列表
        this.orders.push(this.pendingOrder);
        this.saveOrders();

        // 清空待接订单
        this.pendingNPC = null;
        this.pendingOrder = null;

        // 更新订单标记
        updateOrderBadge();

        // 如果在订单页面，刷新显示
        if (currentWorkshopPage === 'orders' && !workshopPanel.classList.contains('hidden')) {
            renderWorkshopOrders();
        }
    },

    // 拒绝订单
    rejectOrder() {
        // 清空待接订单
        this.pendingNPC = null;
        this.pendingOrder = null;

        // 标记玩家已完成过订单（不再是新玩家）
        if (currentPlayer) {
            localStorage.setItem(`farm_order_completed_${currentPlayer}`, 'true');
        }

        // 设置冷却时间
        this.setCooldown();

        // 显示提示
        showAlert('对方失望地离开了。30分钟后可能会有新客人。');
    },

    // 设置冷却时间
    setCooldown() {
        this.nextOrderTime = Date.now() + this.cooldownMinutes * 60 * 1000;
        this.saveNextOrderTime();
    },

    // 完成订单
    completeOrder(orderId) {
        const index = this.orders.findIndex(o => o.id === orderId);
        if (index === -1) return null;

        const order = this.orders[index];

        // 检查库存
        const currentStock = game.inventory.products[order.productName] || 0;
        if (currentStock < order.quantity) {
            return { success: false, message: `${order.productName}数量不足！` };
        }

        // 扣除加工品
        game.inventory.products[order.productName] -= order.quantity;
        if (game.inventory.products[order.productName] === 0) {
            delete game.inventory.products[order.productName];
        }

        // 给予奖励
        game.coins += order.reward;

        // 移除完成订单
        this.orders.splice(index, 1);
        this.saveOrders();

        // 标记玩家已完成过订单（不再是新玩家）
        if (currentPlayer) {
            localStorage.setItem(`farm_order_completed_${currentPlayer}`, 'true');
        }

        // 设置冷却时间
        this.setCooldown();

        // 更新订单数量标记
        updateOrderBadge();

        // 如果在订单页面，刷新显示
        if (currentWorkshopPage === 'orders' && !workshopPanel.classList.contains('hidden')) {
            renderWorkshopOrders();
        }

        // 延迟后检查是否可以生成新订单
        setTimeout(() => {
            this.checkNewOrderAvailable();
        }, 1000);

        return { success: true, order: order };
    },

    // 保存订单到本地存储
    saveOrders() {
        const ordersKey = currentPlayer ? `farm_orders_player${currentPlayer}` : 'farm_orders_v2';
        localStorage.setItem(ordersKey, JSON.stringify(this.orders));
    },

    // 保存下次订单时间
    saveNextOrderTime() {
        const timeKey = currentPlayer ? `farm_order_next_time_player${currentPlayer}` : 'farm_order_next_time';
        localStorage.setItem(timeKey, this.nextOrderTime.toString());
    },

    // 主动寻找新订单
    seekNewOrder() {
        const maxOrders = 5; // 最多同时持有5个订单

        if (this.orders.length >= maxOrders) {
            return { success: false, message: '订单已满，请先完成现有订单' };
        }

        // 生成新订单（非第一份订单，使用随机生成）
        const newOrder = this.generateOrder();
        this.orders.push(newOrder);
        this.saveOrders();

        // 更新订单标记
        updateOrderBadge();

        return { success: true, order: newOrder };
    }
};

// 游戏数据
let game = {
    coins: 100,
    plots: Array(32).fill(null), // 32个地块（4层×8个）
    inventory: {
        seeds: {},      // 种子库存 {作物名: 数量}
        materials: {},  // 原材料库存 - 默认空
        products: {},   // 加工品库存 {加工品名: 数量}
        seasonings: {}  // 调味料库存 - 默认空
    },
    unlockedCrops: [], // 已解锁的作物列表（来自 LOCKED_CROPS）
    unlockedRecipes: [] // 已解锁的高级菜谱列表
};

// 初始化
console.log("作物数据加载完成:", Object.keys(CROPS));

// 存档系统
function saveGame() {
    if (!currentPlayer) {
        console.error('未选择玩家，无法保存');
        return;
    }
    const saveKey = `farm_save_player${currentPlayer}`;
    localStorage.setItem(saveKey, JSON.stringify(game));
    // 同时记录当前玩家，用于页面刷新后恢复
    localStorage.setItem('farm_last_player', currentPlayer);
    console.log(`游戏已保存 (玩家${currentPlayer})`);
}

function loadGame() {
    // 清理旧订单存档（订单系统升级）
    localStorage.removeItem('farm_orders');

    // 先尝试加载当前玩家的存档
    if (!currentPlayer) {
        console.error('未选择玩家，无法加载');
        return;
    }
    
    // 数据迁移：如果玩家1没有存档，但旧存档 farm_save_v3 存在，则迁移
    if (currentPlayer === '1') {
        const oldSave = localStorage.getItem('farm_save_v3');
        const newSave = localStorage.getItem('farm_save_player1');
        if (oldSave && !newSave) {
            localStorage.setItem('farm_save_player1', oldSave);
            localStorage.removeItem('farm_save_v3');
            console.log('朵朵的存档已迁移');
        }
    }
    
    const saveKey = `farm_save_player${currentPlayer}`;
    const saveData = localStorage.getItem(saveKey);
    if (saveData) {
        game = JSON.parse(saveData);
        console.log(`游戏已加载 (玩家${currentPlayer})`);

        // 确保 unlockedCrops 字段存在
        if (!game.unlockedCrops) {
            game.unlockedCrops = [];
        }
        // 确保 unlockedRecipes 字段存在
        if (!game.unlockedRecipes) {
            game.unlockedRecipes = [];
        }
        // 强制重置：将包谷和大蒜改回未解锁状态
        game.unlockedCrops = game.unlockedCrops.filter(name => name !== "包谷" && name !== "大蒜");
        // 检查并解锁高级菜谱
        checkRecipeUnlocks();
        restorePlots();
        return;
    } else {
        // 新玩家 - 根据玩家使用不同的初始配置
        console.log(`新游戏 (玩家${currentPlayer})`);
        
        if (currentPlayer === '2') {
            // 麦麦：150银币 + 能做一份薯片的材料
            game = {
                coins: 150,
                plots: Array(32).fill(null),
                inventory: {
                    seeds: {},
                    materials: {
                        "土豆": 2  // 做薯片需要2个土豆
                    },
                    products: {},
                    seasonings: {
                        "盐": 1  // 做薯片需要1份盐
                    }
                },
                unlockedCrops: [],
                unlockedRecipes: []
            };
            // 麦麦新玩家初始化完成，立即保存
            restorePlots();
            saveGame(); // 立即保存初始状态
            return;
        } else {
            // 朵朵：100银币 + 初始材料
            game = {
                coins: 100,
                plots: Array(32).fill(null),
                inventory: {
                    seeds: {},
                    materials: {
                        "土豆": 10,
                        "辣椒": 10,
                        "白菜": 10,
                        "葱": 10,
                        "洋葱": 10,
                        "萝卜": 10,
                        "折耳根": 10,
                        "西红柿": 10
                    },
                    products: {},
                    seasonings: {
                        "盐": 10,
                        "糖": 10,
                        "陈醋": 10,
                        "酱油": 10,
                        "干辣椒面": 10,
                        "豆瓣酱": 10,
                        "花椒": 10,
                        "料酒": 10
                    }
                },
                unlockedCrops: [],
                unlockedRecipes: []
            };
            // 朵朵新玩家初始化完成，立即保存
            restorePlots();
            saveGame(); // 立即保存初始状态
            return;
        }
    }

    // 兼容 v2 格式存档（自动迁移，重置解锁状态）
    const saveV2 = localStorage.getItem('farm_save_v2');
    if (saveV2) {
        game = JSON.parse(saveV2);
        console.log('检测到 v2 存档，正在迁移...');
        // v3 重置：清空已解锁作物列表
        game.unlockedCrops = [];
        console.log('已重置解锁作物列表');
        // 保存为 v3 格式
        saveGame();
        // 删除旧存档
        localStorage.removeItem('farm_save_v2');
        console.log('存档迁移完成');
        restorePlots();
        return;
    }

    // 兼容旧格式存档
    const saveV1 = localStorage.getItem('farm_save');
    if (saveV1) {
        const oldGame = JSON.parse(saveV1);
        console.log('检测到旧存档，正在转换...');

        // 转换数据结构
        game.coins = oldGame.coins || 100;
        game.plots = oldGame.plots || Array(32).fill(null);

        // 旧 inventory 是 {作物名: 数量}，全部转为 seeds
        game.inventory.seeds = oldGame.inventory || {};

        // 其他库存初始化为空
        game.inventory.materials = {};
        game.inventory.products = {};
        game.inventory.seasonings = { "盐": 5 };

        // 初始化解锁作物列表
        game.unlockedCrops = [];

        // 保存为新格式
        saveGame();

        // 删除旧存档
        localStorage.removeItem('farm_save');

        console.log('存档转换完成');
        restorePlots();
    }
}

function restorePlots() {
    // 恢复所有地块的视觉状态
    game.plots.forEach((plotData, index) => {
        if (plotData) {
            const plotEl = plots[index];
            const crop = CROPS[plotData.cropType] || LOCKED_CROPS[plotData.cropType];

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

// 检查并解锁高级菜谱
function checkRecipeUnlocks() {
    const lockedCropNames = Object.keys(LOCKED_CROPS);
    const unlockedSet = new Set(game.unlockedCrops || []);

    // 检查是否所有锁定作物都已解锁
    const allCropsUnlocked = lockedCropNames.every(name => unlockedSet.has(name));

    if (allCropsUnlocked) {
        // 获取所有需要解锁的菜谱
        const lockedRecipes = Object.keys(RECIPES).filter(name => RECIPES[name].locked);
        const newlyUnlocked = [];

        lockedRecipes.forEach(recipeName => {
            if (!game.unlockedRecipes.includes(recipeName)) {
                game.unlockedRecipes.push(recipeName);
                newlyUnlocked.push(recipeName);
            }
        });

        if (newlyUnlocked.length > 0) {
            console.log('解锁高级菜谱:', newlyUnlocked);
            // 保存游戏
            saveGame();
        }
    }
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
    // 检查仓库是否为空（只看种子）
    const hasSeeds = Object.values(game.inventory.seeds).some(count => count > 0);
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
    if (!game.inventory.seeds[cropName] || game.inventory.seeds[cropName] <= 0) {
        showAlert('种子数量不足！');
        return;
    }

    // 消耗种子
    game.inventory.seeds[cropName]--;

    // 种植
    game.plots[plotIndex] = {
        cropType: cropName,
        plantedAt: Date.now() / 1000,
        stage: 0
    };

    // 显示作物图标
    const crop = CROPS[cropName] || LOCKED_CROPS[cropName];
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
    const crop = CROPS[plotData.cropType] || LOCKED_CROPS[plotData.cropType];

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
    const crop = CROPS[plotData.cropType] || LOCKED_CROPS[plotData.cropType];

    // 获得原材料（而不是银币）
    if (!game.inventory.materials[plotData.cropType]) {
        game.inventory.materials[plotData.cropType] = 0;
    }
    game.inventory.materials[plotData.cropType]++;

    // 清空地块
    game.plots[index] = null;
    plotEl.textContent = '';

    showAlert(`收获了 ${crop.name} ${crop.icon}！`, '🎉 收获');

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
    let hasAnyItems = false;

    // 辅助函数：创建分类标题
    function createSectionTitle(title) {
        const titleEl = document.createElement('div');
        titleEl.className = 'warehouse-section-title';
        titleEl.textContent = title;
        titleEl.style.cssText = 'grid-column: 1 / -1; font-size: 14px; color: #8B7355; padding: 10px 0 5px; border-bottom: 1px solid #D0D0C8; margin-bottom: 5px;';
        return titleEl;
    }

    // 辅助函数：创建物品项
    function createItem(name, icon, count, type, clickHandler) {
        const item = document.createElement('div');
        item.className = 'warehouse-item';
        item.innerHTML = `
            <div class="warehouse-seed-icon">${icon}</div>
            <div class="warehouse-seed-info">
                <div class="warehouse-seed-name">${name}</div>
                <div class="warehouse-seed-count">x${count}</div>
            </div>
        `;
        if (clickHandler) {
            item.addEventListener('click', clickHandler);
            item.style.cursor = 'pointer';
        }
        return item;
    }

    // 1. 种子分类
    const seedKeys = Object.keys(game.inventory.seeds).filter(k => game.inventory.seeds[k] > 0);
    if (seedKeys.length > 0) {
        hasAnyItems = true;
        warehouseList.appendChild(createSectionTitle('🫘 种子'));
        seedKeys.forEach(cropName => {
            // 先从基础作物查找，再从解锁作物查找
            const crop = CROPS[cropName] || LOCKED_CROPS[cropName];
            if (crop) {
                const item = createItem(crop.name, '🫘', game.inventory.seeds[cropName], 'seed',
                    isPlantMode ? () => plantFromWarehouse(cropName) : null);
                if (isPlantMode) {
                    item.style.borderColor = '#90A090';
                    item.style.background = '#F0F5F0';
                }
                warehouseList.appendChild(item);
            }
        });
    }

    // 2. 原材料分类
    const materialKeys = Object.keys(game.inventory.materials).filter(k => game.inventory.materials[k] > 0);
    if (materialKeys.length > 0) {
        hasAnyItems = true;
        warehouseList.appendChild(createSectionTitle('🌾 原材料'));
        materialKeys.forEach(cropName => {
            // 先从基础作物查找，再从解锁作物查找
            const crop = CROPS[cropName] || LOCKED_CROPS[cropName];
            if (crop) {
                warehouseList.appendChild(createItem(crop.name, crop.icon, game.inventory.materials[cropName], 'material'));
            }
        });
    }

    // 3. 调味料分类
    const seasoningKeys = Object.keys(game.inventory.seasonings).filter(k => game.inventory.seasonings[k] > 0);
    if (seasoningKeys.length > 0) {
        hasAnyItems = true;
        warehouseList.appendChild(createSectionTitle('🧂 调味料'));
        seasoningKeys.forEach(name => {
            const seasoning = SEASONINGS[name];
            warehouseList.appendChild(createItem(seasoning.name, seasoning.icon, game.inventory.seasonings[name], 'seasoning'));
        });
    }

    // 4. 加工品分类
    const productKeys = Object.keys(game.inventory.products).filter(k => game.inventory.products[k] > 0);
    if (productKeys.length > 0) {
        hasAnyItems = true;
        warehouseList.appendChild(createSectionTitle('🍽️ 加工品'));
        productKeys.forEach(name => {
            const recipe = RECIPES[name];
            warehouseList.appendChild(createItem(recipe.name, recipe.icon, game.inventory.products[name], 'product'));
        });
    }

    // 显示或隐藏空仓库提示
    if (hasAnyItems) {
        warehouseEmpty.classList.add('hidden');
        warehouseList.classList.remove('hidden');
    } else {
        warehouseEmpty.textContent = '仓库空空如也，快去种植或购买吧！';
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

    // 初始化订单系统（只在有当前玩家时）
    if (currentPlayer) {
        ORDER_SYSTEM.initOrders();
        // 更新订单数量标记
        updateOrderBadge();
    }

    // 定期检查是否有新订单可用（每分钟检查一次）
    setInterval(() => {
        if (currentPlayer) {
            ORDER_SYSTEM.checkNewOrderAvailable();
        }
    }, 60000);

    // 检查是否已开始游戏（点击过开始游戏按钮但未结束）
    const hasStarted = localStorage.getItem('farm_started');
    const lastPlayer = localStorage.getItem('farm_last_player');
    
    if (hasStarted === 'true' && lastPlayer) {
        // 恢复上次玩的玩家
        currentPlayer = lastPlayer;
        console.log(`恢复到玩家${currentPlayer}`);
        
        // 加载该玩家数据
        loadGame();
        
        // 重新初始化该玩家的订单系统
        ORDER_SYSTEM.initOrders();
        
        // 已进入游戏主界面
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
setInterval(saveGame, 1000);

// 页面刷新或关闭前保存
window.addEventListener('beforeunload', () => {
    if (currentPlayer) {
        saveGame();
        console.log('页面卸载前已保存');
    }
});

// 商店当前选中的标签
let currentShopTab = 'seeds';

// 商店切换按钮
const tabSeeds = document.getElementById('tab-seeds');
const tabSeasonings = document.getElementById('tab-seasonings');

function switchShopTab(tab) {
    currentShopTab = tab;
    if (tab === 'seeds') {
        tabSeeds.classList.add('active');
        tabSeasonings.classList.remove('active');
    } else {
        tabSeeds.classList.remove('active');
        tabSeasonings.classList.add('active');
    }
    generateShop();
}

tabSeeds.addEventListener('click', () => switchShopTab('seeds'));
tabSeasonings.addEventListener('click', () => switchShopTab('seasonings'));

function generateShop() {
    console.log('生成商店...');
    const shopList = document.getElementById('shop-list');
    if (!shopList) {
        console.error('找不到 shop-list 元素!');
        return;
    }
    shopList.innerHTML = '';

    const itemsPerShelf = 3; // 每层3个
    let currentRow = null;

    if (currentShopTab === 'seeds') {
        // 显示基础种子
        const cropNames = Object.keys(CROPS);
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

        // 获取已解锁作物
        const unlockedSet = new Set(game.unlockedCrops || []);

        // 显示已解锁的作物（放在种子区域）
        const lockedCropNames = Object.keys(LOCKED_CROPS);
        const unlockedCrops = lockedCropNames.filter(name => unlockedSet.has(name));

        if (unlockedCrops.length > 0) {
            unlockedCrops.forEach((cropName, index) => {
                // 继续当前行或创建新行
                const currentCount = cropNames.length + index;
                if (currentCount % itemsPerShelf === 0) {
                    currentRow = document.createElement('div');
                    currentRow.className = 'shelf-row';
                    shopList.appendChild(currentRow);
                }

                const crop = LOCKED_CROPS[cropName];
                const seedItem = document.createElement('div');
                seedItem.className = 'seed-item';
                seedItem.innerHTML = `
                    <div class="seed-icon">🫘</div>
                    <div class="seed-name">${crop.name}</div>
                    <div class="seed-price">${crop.seedPrice}🪙</div>
                `;
                seedItem.addEventListener('click', () => buyLockedSeed(cropName, seedItem));
                currentRow.appendChild(seedItem);
            });
        }

        // 显示未解锁的作物
        const lockedCrops = lockedCropNames.filter(name => !unlockedSet.has(name));

        if (lockedCrops.length > 0) {
            // 添加分隔
            const divider = document.createElement('div');
            divider.className = 'shop-divider';
            divider.innerHTML = '<span>🔒 待解锁作物</span>';
            shopList.appendChild(divider);

            // 显示待解锁的作物
            let lockedIndex = 0;
            lockedCrops.forEach((cropName) => {
                const crop = LOCKED_CROPS[cropName];

                // 每3个创建一个新货架层
                if (lockedIndex % itemsPerShelf === 0) {
                    currentRow = document.createElement('div');
                    currentRow.className = 'shelf-row';
                    shopList.appendChild(currentRow);
                }

                const seedItem = document.createElement('div');
                seedItem.className = 'seed-item locked';
                const stars = '★'.repeat(crop.rarity) + '☆'.repeat(3 - crop.rarity);
                seedItem.innerHTML = `
                    <div class="seed-icon">${crop.icon}</div>
                    <div class="seed-name">${stars}</div>
                    <div class="seed-price unlock-price">🔓 ${crop.unlockPrice}🪙</div>
                `;
                seedItem.addEventListener('click', () => unlockCrop(cropName, seedItem));
                currentRow.appendChild(seedItem);
                lockedIndex++;
            });
        }

        // 最后一行如果不足3个，补充空白占位
        if (currentRow && currentRow.children.length < itemsPerShelf) {
            const emptySlots = itemsPerShelf - currentRow.children.length;
            for (let i = 0; i < emptySlots; i++) {
                const emptySlot = document.createElement('div');
                emptySlot.style.width = '80px';
                currentRow.appendChild(emptySlot);
            }
        }
    } else {
        // 显示调味料
        const seasoningNames = Object.keys(SEASONINGS);
        seasoningNames.forEach((name, index) => {
            // 每3个创建一个新货架层
            if (index % itemsPerShelf === 0) {
                currentRow = document.createElement('div');
                currentRow.className = 'shelf-row';
                shopList.appendChild(currentRow);
            }

            const seasoning = SEASONINGS[name];
            const item = document.createElement('div');
            item.className = 'seed-item';
            item.innerHTML = `
                <div class="seed-icon">${seasoning.icon}</div>
                <div class="seed-name">${seasoning.name}</div>
                <div class="seed-price">${seasoning.buyPrice}🪙</div>
            `;

            item.addEventListener('click', () => buySeasoning(name, item));
            currentRow.appendChild(item);
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
}

// 购买调味料
function buySeasoning(name, itemEl) {
    const seasoning = SEASONINGS[name];

    // 检查银币
    if (game.coins < seasoning.buyPrice) {
        showAlert('银币不足！');
        AudioSys.playError();
        return;
    }

    // 显示自定义确认弹窗
    showConfirm(`确认购买 ${seasoning.name}？
价格：${seasoning.buyPrice}🪙`, (confirmed) => {
        if (!confirmed) {
            return;
        }

        // 扣除银币
        game.coins -= seasoning.buyPrice;
        updateCoins();

        // 添加调味料到仓库
        if (!game.inventory.seasonings[name]) {
            game.inventory.seasonings[name] = 0;
        }
        game.inventory.seasonings[name]++;

        // 显示购买成功
        itemEl.style.transform = 'scale(0.95)';
        setTimeout(() => {
            itemEl.style.transform = '';
        }, 150);

        // 播放金币音效
        AudioSys.playCoin();

        console.log(`购买了 ${name}，库存：${game.inventory.seasonings[name]}`);

        // 保存游戏
        saveGame();
    });
}

// ========== 加工坊系统 ==========
const workshopBtn = document.getElementById('workshop-btn');
const workshopPanel = document.getElementById('workshop-panel');
const closeWorkshopBtn = document.getElementById('close-workshop');
const workshopOrdersBtn = document.getElementById('workshop-orders-btn');
const workshopRecipesBtn = document.getElementById('workshop-recipes-btn');
const workshopMaterialsList = document.getElementById('workshop-materials-list');
const workshopRecipesList = document.getElementById('workshop-recipes-list');
const workshopOrdersList = document.getElementById('workshop-orders-list');
const workshopOrdersPage = document.getElementById('workshop-orders-page');
const workshopRecipesPage = document.getElementById('workshop-recipes-page');

// 加工坊当前页面
let currentWorkshopPage = 'recipes'; // 'orders' 或 'recipes'
let isCooking = false; // 是否正在烹饪

// 切换加工坊页面
function switchWorkshopPage(page) {
    currentWorkshopPage = page;
    if (page === 'orders') {
        workshopOrdersPage.classList.remove('hidden');
        workshopRecipesPage.classList.add('hidden');
        workshopOrdersBtn.classList.add('active');
        workshopRecipesBtn.classList.remove('active');
        // 渲染订单列表
        renderWorkshopOrders();
    } else {
        workshopOrdersPage.classList.add('hidden');
        workshopRecipesPage.classList.remove('hidden');
        workshopOrdersBtn.classList.remove('active');
        workshopRecipesBtn.classList.add('active');
    }
}

// 加工坊按钮
workshopBtn.addEventListener('click', () => {
    renderWorkshop();
    workshopPanel.classList.remove('hidden');
    AudioSys.playOpen();
    // 播放加工坊背景音乐
    playWorkshopMusic();
});

closeWorkshopBtn.addEventListener('click', () => {
    workshopPanel.classList.add('hidden');
    // 播放主页面背景音乐
    playFarmMusic();
});

// 加工坊内部页面切换
workshopOrdersBtn.addEventListener('click', () => {
    switchWorkshopPage('orders');
    AudioSys.playOpen();
});

workshopRecipesBtn.addEventListener('click', () => {
    switchWorkshopPage('recipes');
    AudioSys.playOpen();
});

// 页面内关闭按钮 - 只隐藏当前页面，停留在加工坊背景页
document.querySelectorAll('.workshop-page-close').forEach(btn => {
    btn.addEventListener('click', () => {
        workshopOrdersPage.classList.add('hidden');
        workshopRecipesPage.classList.add('hidden');
        workshopOrdersBtn.classList.remove('active');
        workshopRecipesBtn.classList.remove('active');
        AudioSys.playOpen();
    });
});

// 更新订单数量标记
function updateOrderBadge() {
    const badge = document.getElementById('order-badge');
    if (badge) {
        badge.textContent = ORDER_SYSTEM.orders.length;
        badge.style.display = ORDER_SYSTEM.orders.length > 0 ? 'flex' : 'none';
    }
}

// 渲染加工坊
function renderWorkshop() {
    // 渲染原材料
    renderWorkshopMaterials();

    // 渲染菜谱
    renderWorkshopRecipes();
}

// 渲染订单列表
function renderWorkshopOrders() {
    workshopOrdersList.innerHTML = '';

    // 添加"寻找新订单"按钮
    const seekBtn = document.createElement('button');
    seekBtn.className = 'seek-order-btn';
    seekBtn.innerHTML = '🔍 寻找新订单';
    seekBtn.onclick = () => {
        const result = ORDER_SYSTEM.seekNewOrder();
        if (result.success) {
            showAlert(`找到新订单：${RECIPES[result.order.productName].name} × ${result.order.quantity}`, '📋 订单获取成功');
            renderWorkshopOrders();
        } else {
            showAlert(result.message, '💡 提示');
        }
    };
    workshopOrdersList.appendChild(seekBtn);

    if (ORDER_SYSTEM.orders.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'color: #999; text-align: center; padding: 40px;';
        emptyMsg.textContent = '暂无订单，点击上方按钮寻找新订单~';
        workshopOrdersList.appendChild(emptyMsg);
        return;
    }

    ORDER_SYSTEM.orders.forEach(order => {
        const recipe = RECIPES[order.productName];
        const card = document.createElement('div');
        card.className = 'order-card';

        // 检查库存是否足够
        const currentStock = game.inventory.products[order.productName] || 0;
        const canComplete = currentStock >= order.quantity;

        card.innerHTML = `
            <div class="order-npc">
                <span class="npc-icon">${order.npc.icon}</span>
                <span class="npc-name">${order.npc.name}</span>
            </div>
            <div class="order-greeting">"${order.npc.greeting}"</div>
            <div class="order-demand">
                <span class="demand-icon">${recipe.icon}</span>
                <span class="demand-text">${recipe.name} × ${order.quantity}</span>
            </div>
            <div class="order-reward">💰 ${order.reward} 银币</div>
            <div class="order-stock">库存: ${currentStock}/${order.quantity}</div>
            <button class="complete-order-btn" ${canComplete ? '' : 'disabled'}>
                ${canComplete ? '交付' : '库存不足'}
            </button>
        `;

        // 绑定交付事件
        const completeBtn = card.querySelector('.complete-order-btn');
        if (canComplete) {
            completeBtn.addEventListener('click', () => completeOrder(order.id, card));
        }

        workshopOrdersList.appendChild(card);
    });
}

// 完成订单
function completeOrder(orderId, cardEl) {
    const result = ORDER_SYSTEM.completeOrder(orderId);

    if (!result.success) {
        showAlert(result.message);
        AudioSys.playError();
        return;
    }

    // 播放音效
    AudioSys.playCoin();

    // 显示完成动画
    cardEl.style.transform = 'scale(0.95)';
    cardEl.style.opacity = '0.5';

    setTimeout(() => {
        // 刷新订单列表
        renderWorkshopOrders();

        // 更新订单数量标记
        updateOrderBadge();

        // 提示
        showAlert(`订单完成！获得 ${result.order.reward} 银币`, '💰 交易成功');

        // 保存游戏
        saveGame();
    }, 300);
}

// 渲染原材料
function renderWorkshopMaterials() {
    workshopMaterialsList.innerHTML = '';

    // 原材料
    const materialKeys = Object.keys(game.inventory.materials).filter(k => game.inventory.materials[k] > 0);
    materialKeys.forEach(cropName => {
        // 先从基础作物查找，再从解锁作物查找
        const crop = CROPS[cropName] || LOCKED_CROPS[cropName];
        if (!crop) return;
        const item = document.createElement('div');
        item.className = 'material-item';
        item.innerHTML = `
            <span class="material-icon">${crop.icon}</span>
            <span>${crop.name}</span>
            <span class="material-count">${game.inventory.materials[cropName]}</span>
        `;
        workshopMaterialsList.appendChild(item);
    });

    // 调味料
    const seasoningKeys = Object.keys(game.inventory.seasonings).filter(k => game.inventory.seasonings[k] > 0);
    seasoningKeys.forEach(name => {
        const seasoning = SEASONINGS[name];
        const item = document.createElement('div');
        item.className = 'material-item';
        item.innerHTML = `
            <span class="material-icon">${seasoning.icon}</span>
            <span>${seasoning.name}</span>
            <span class="material-count">${game.inventory.seasonings[name]}</span>
        `;
        workshopMaterialsList.appendChild(item);
    });

    if (materialKeys.length === 0 && seasoningKeys.length === 0) {
        workshopMaterialsList.innerHTML = '<span style="color: #999; font-size: 13px;">暂无原材料，先去种植或购买吧~</span>';
    }
}

// 渲染菜谱
function renderWorkshopRecipes() {
    workshopRecipesList.innerHTML = '';

    Object.keys(RECIPES).forEach(recipeName => {
        const recipe = RECIPES[recipeName];
        const card = document.createElement('div');
        card.className = 'recipe-card';

        // 检查菜谱是否被锁定
        const isLocked = recipe.locked && !game.unlockedRecipes.includes(recipeName);

        if (isLocked) {
            // 显示锁定状态
            card.classList.add('locked');
            card.innerHTML = `
                <div class="recipe-icon locked-icon">🔒</div>
                <div class="recipe-name" style="color: #999;">???</div>
                <div class="recipe-ingredients" style="color: #999; font-size: 12px;">解锁所有蔬菜后开放</div>
                <button class="craft-btn" disabled>未解锁</button>
            `;
            workshopRecipesList.appendChild(card);
            return;
        }

        // 检查材料是否充足
        const canCraft = checkCanCraft(recipe);
        if (canCraft) {
            card.classList.add('can-craft');
        }

        // 生成材料显示
        const ingredientsHtml = Object.entries(recipe.ingredients).map(([name, count]) => {
            const hasEnough = getMaterialCount(name) >= count;
            const icon = getMaterialIcon(name);
            return `<span class="ingredient ${hasEnough ? '' : 'missing'}">${icon}${count}</span>`;
        }).join(' ');

        // 判断是否可制作（材料充足且没有在烹饪中）
        const canMake = canCraft && !isCooking;

        card.innerHTML = `
            <div class="recipe-icon"><img src="${recipe.productImage}" alt="${recipe.name}" class="recipe-image"></div>
            <div class="recipe-name">${recipe.name}</div>
            <div class="recipe-ingredients">${ingredientsHtml}</div>
            <button class="craft-btn" ${canMake ? '' : 'disabled'}>
                ${isCooking ? '制作中...' : (canCraft ? '制作' : '材料不足')}
            </button>
        `;

        // 绑定制作事件
        const craftBtn = card.querySelector('.craft-btn');
        if (canMake) {
            craftBtn.addEventListener('click', () => craftRecipe(recipeName, card));
        }

        workshopRecipesList.appendChild(card);
    });
}

// 获取材料数量
function getMaterialCount(name) {
    if (game.inventory.materials[name]) {
        return game.inventory.materials[name];
    }
    if (game.inventory.seasonings[name]) {
        return game.inventory.seasonings[name];
    }
    return 0;
}

// 获取材料图标
function getMaterialIcon(name) {
    if (CROPS[name]) return CROPS[name].icon;
    if (LOCKED_CROPS[name]) return LOCKED_CROPS[name].icon;
    if (SEASONINGS[name]) return SEASONINGS[name].icon;
    return '📦';
}

// 检查是否可以制作
function checkCanCraft(recipe) {
    return Object.entries(recipe.ingredients).every(([name, count]) => {
        return getMaterialCount(name) >= count;
    });
}

// 制作配方
function craftRecipe(recipeName, cardEl) {
    if (isCooking) {
        showAlert('已经有菜品在制作了，请稍后再试！');
        return;
    }

    const recipe = RECIPES[recipeName];

    // 扣除材料
    Object.entries(recipe.ingredients).forEach(([name, count]) => {
        if (game.inventory.materials[name]) {
            game.inventory.materials[name] -= count;
        } else if (game.inventory.seasonings[name]) {
            game.inventory.seasonings[name] -= count;
        }
    });

    // 刷新原材料显示
    renderWorkshopMaterials();

    // 设置烹饪状态
    isCooking = true;

    // 禁用所有制作按钮
    document.querySelectorAll('.craft-btn').forEach(btn => {
        btn.disabled = true;
    });

    // 显示烹饪动画
    showCookingAnimation(cardEl, recipeName, recipe);
}

// 显示烹饪动画
function showCookingAnimation(cardEl, recipeName, recipe) {
    const cookTime = 10000; // 10秒烹饪时间

    // 保存原始内容
    const originalContent = cardEl.innerHTML;
    cardEl.dataset.originalContent = originalContent;

    // 显示烹饪界面
    cardEl.innerHTML = `
        <div class="cooking-container">
            <div class="pot-wrapper">
                <img src="pot.png" class="cooking-pot" alt="锅">
            </div>
            <div class="cooking-text">制作中...</div>
            <div class="cooking-progress">
                <div class="cooking-progress-bar"></div>
            </div>
        </div>
    `;

    cardEl.classList.add('cooking');

    // 播放开始音效
    AudioSys.playPlant();

    // 进度条动画
    const progressBar = cardEl.querySelector('.cooking-progress-bar');
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 1;
        progressBar.style.width = `${progress}%`;
    }, cookTime / 100);

    // 10秒后完成
    setTimeout(() => {
        clearInterval(progressInterval);

        // 播放完成音效
        AudioSys.playHarvest();

        // 添加加工品到库存
        if (!game.inventory.products[recipeName]) {
            game.inventory.products[recipeName] = 0;
        }
        game.inventory.products[recipeName]++;

        // 恢复卡片原状
        cardEl.classList.remove('cooking');
        cardEl.innerHTML = originalContent;
        isCooking = false;
        renderWorkshop();

        // 显示全屏完成特效
        showCookingCompleteOverlay(recipe);

        // 保存游戏
        saveGame();
    }, cookTime);
}

// 显示烹饪完成全屏特效
function showCookingCompleteOverlay(recipe) {
    const overlay = document.getElementById('cooking-complete-overlay');
    const productImage = document.getElementById('complete-product-image');
    const productName = document.getElementById('complete-product-name');

    // 设置成品图片和名称
    productImage.src = recipe.productImage;
    productName.textContent = recipe.name;

    // 显示遮罩层
    overlay.classList.remove('hidden');

    // 重新触发动画（通过移除再添加元素）
    const flashEffect = overlay.querySelector('.flash-effect');
    const productShowcase = overlay.querySelector('.product-showcase');

    // 移除动画类
    flashEffect.style.animation = 'none';
    productShowcase.style.animation = 'none';

    // 强制重绘
    void flashEffect.offsetWidth;
    void productShowcase.offsetWidth;

    // 重新添加动画
    flashEffect.style.animation = 'flashWhite 0.8s ease-out';
    productShowcase.style.animation = 'productBounce 2s ease-out forwards';

    // 3秒后隐藏
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 3000);
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

// 订单通知按钮
const orderNotification = document.getElementById('order-notification');
const orderNotificationBtn = document.getElementById('order-notification-btn');

// NPC对话弹窗元素
const dialogueModal = document.getElementById('dialogue-modal');
const dialogueNpcIcon = document.getElementById('dialogue-npc-icon');
const dialogueNpcName = document.getElementById('dialogue-npc-name');
const dialogueText = document.getElementById('dialogue-text');
const dialogueNextBtn = document.getElementById('dialogue-next');
const dialogueOrderInfo = document.getElementById('dialogue-order-info');
const dialogueOrderIcon = document.getElementById('dialogue-order-icon');
const dialogueOrderDetails = document.getElementById('dialogue-order-details');
const dialogueOrderReward = document.getElementById('dialogue-order-reward');
const dialogueAcceptBtn = document.getElementById('dialogue-accept');
const dialogueRejectBtn = document.getElementById('dialogue-reject');

// 当前对话状态
let currentDialogueIndex = 0;
let currentDialogues = [];
let currentNPC = null;
let currentOrder = null;

// 显示订单通知按钮
function showOrderNotificationButton(npc) {
    orderNotification.classList.remove('hidden');
    // 添加动画效果
    setTimeout(() => {
        orderNotification.style.transform = 'translateX(0)';
    }, 100);
}

// 隐藏订单通知按钮
function hideOrderNotificationButton() {
    orderNotification.style.transform = 'translateX(150%)';
    setTimeout(() => {
        orderNotification.classList.add('hidden');
    }, 300);
}

// 点击通知按钮开始对话
orderNotificationBtn.addEventListener('click', () => {
    ORDER_SYSTEM.startDialogue();
});

// 显示NPC对话
function showNPCDialogue(npc, dialogues, order) {
    currentNPC = npc;
    currentDialogues = dialogues;
    currentOrder = order;
    currentDialogueIndex = 0;

    // 设置NPC信息
    dialogueNpcIcon.textContent = npc.icon;
    dialogueNpcName.textContent = npc.name;

    // 显示第一句对话
    dialogueText.textContent = dialogues[0];

    // 隐藏订单信息区域
    dialogueOrderInfo.classList.add('hidden');
    dialogueNextBtn.classList.remove('hidden');

    // 显示对话弹窗
    dialogueModal.classList.remove('hidden');
}

// 点击继续按钮推进对话
dialogueNextBtn.addEventListener('click', () => {
    currentDialogueIndex++;

    if (currentDialogueIndex < currentDialogues.length) {
        // 继续下一句对话
        dialogueText.textContent = currentDialogues[currentDialogueIndex];
    } else {
        // 对话结束，显示订单信息
        dialogueText.textContent = `需要【${currentOrder.productName} x${currentOrder.quantity}】，给你【${currentOrder.reward}银币】，怎么样？`;

        // 设置订单信息
        dialogueOrderIcon.textContent = currentOrder.productIcon;
        dialogueOrderDetails.textContent = `${currentOrder.productName} × ${currentOrder.quantity}`;
        dialogueOrderReward.textContent = `💰 ${currentOrder.reward}银币`;

        // 显示订单信息和按钮
        dialogueOrderInfo.classList.remove('hidden');
        dialogueNextBtn.classList.add('hidden');
    }
});

// 点击接单按钮
dialogueAcceptBtn.addEventListener('click', () => {
    dialogueModal.classList.add('hidden');
    ORDER_SYSTEM.acceptOrder();
    showAlert(`已接受${currentNPC.name}的订单！`, '📋 接单成功');
});

// 点击不接按钮
dialogueRejectBtn.addEventListener('click', () => {
    dialogueModal.classList.add('hidden');
    ORDER_SYSTEM.rejectOrder();
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
    showConfirm(`确认购买 ${crop.name} 种子？
价格：${crop.seedPrice}🪙`, (confirmed) => {
        if (!confirmed) {
            return;
        }

        // 扣除银币
        game.coins -= crop.seedPrice;
        updateCoins();

        // 添加种子到仓库
        if (!game.inventory.seeds[cropName]) {
            game.inventory.seeds[cropName] = 0;
        }
        game.inventory.seeds[cropName]++;

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

// 解锁新作物
function unlockCrop(cropName, itemEl) {
    const crop = LOCKED_CROPS[cropName];

    // 检查银币
    if (game.coins < crop.unlockPrice) {
        showAlert(`银币不足！需要 ${crop.unlockPrice}🪙 解锁`);
        AudioSys.playError();
        return;
    }

    // 显示确认弹窗
    showConfirm(`确认解锁 ${crop.name}？
价格：${crop.unlockPrice}🪙

解锁后可购买该作物种子。`, (confirmed) => {
        if (!confirmed) {
            return;
        }

        // 扣除银币
        game.coins -= crop.unlockPrice;
        updateCoins();

        // 添加到已解锁列表
        if (!game.unlockedCrops) {
            game.unlockedCrops = [];
        }
        game.unlockedCrops.push(cropName);

        // 播放金币音效
        AudioSys.playCoin();

        // 显示成功提示
        showAlert(`🎉 解锁成功！
现在可以购买 ${crop.name} 种子了。`);

        // 保存游戏
        saveGame();

        // 刷新商店显示
        generateShop();

        // 检查是否解锁了高级菜谱
        const prevUnlockedCount = game.unlockedRecipes ? game.unlockedRecipes.length : 0;
        checkRecipeUnlocks();
        const newUnlockedCount = game.unlockedRecipes ? game.unlockedRecipes.length : 0;

        if (newUnlockedCount > prevUnlockedCount) {
            // 有新菜谱解锁
            setTimeout(() => {
                showAlert('🎊 恭喜！你已解锁所有蔬菜，加工坊新增10道高级菜谱！');
            }, 500);
        }
    });
}

// 购买已解锁的作物种子
function buyLockedSeed(cropName, seedItemEl) {
    const crop = LOCKED_CROPS[cropName];

    // 检查银币
    if (game.coins < crop.seedPrice) {
        showAlert('银币不足！');
        AudioSys.playError();
        return;
    }

    // 显示自定义确认弹窗
    showConfirm(`确认购买 ${crop.name} 种子？
价格：${crop.seedPrice}🪙`, (confirmed) => {
        if (!confirmed) {
            return;
        }

        // 扣除银币
        game.coins -= crop.seedPrice;
        updateCoins();

        // 添加种子到仓库
        if (!game.inventory.seeds[cropName]) {
            game.inventory.seeds[cropName] = 0;
        }
        game.inventory.seeds[cropName]++;

        // 显示购买成功
        seedItemEl.style.transform = 'scale(0.95)';
        setTimeout(() => {
            seedItemEl.style.transform = '';
        }, 150);

        // 播放金币音效
        AudioSys.playCoin();

        console.log(`购买了 ${cropName} 种子，库存：${game.inventory.seeds[cropName]}`);

        // 保存游戏
        saveGame();
    });
}

// 启动页和视频播放逻辑
const startScreen = document.getElementById('start-screen');
// 更新账号选择界面状态
function updateAccountStatus() {
    // 检查玩家1是否有存档
    const save1 = localStorage.getItem('farm_save_player1');
    const status1 = document.getElementById('player1-status');
    if (save1) {
        status1.textContent = '继续游戏';
        status1.style.color = '#4CAF50';
    } else {
        status1.textContent = '';
    }
    
    // 检查玩家2是否有存档
    const save2 = localStorage.getItem('farm_save_player2');
    const status2 = document.getElementById('player2-status');
    if (save2) {
        status2.textContent = '继续游戏';
        status2.style.color = '#4CAF50';
    } else {
        status2.textContent = '';
    }
}

const startGameBtn = document.getElementById('start-game-btn');
const accountSelectScreen = document.getElementById('account-select-screen');
const accountCards = document.querySelectorAll('.account-card');
const backToStartBtn = document.getElementById('back-to-start');
const videoLayer = document.getElementById('video-layer');
const introVideo = document.getElementById('intro-video');
const gameContainer = document.getElementById('game-container');

startGameBtn.addEventListener('click', () => {
    // 隐藏启动页，显示账号选择界面
    startScreen.classList.add('hidden');
    accountSelectScreen.classList.remove('hidden');
    
    // 更新账号状态显示
    updateAccountStatus();
});

// 账号卡片点击事件
accountCards.forEach(card => {
    card.addEventListener('click', () => {
        const playerNum = card.dataset.player;
        
        // 如果之前有玩家在玩，先保存旧玩家数据
        if (currentPlayer && currentPlayer !== playerNum) {
            saveGame();
            console.log(`已保存玩家${currentPlayer}的数据`);
        }
        
        // 设置新玩家
        currentPlayer = playerNum;
        
        // 立即记录当前玩家，防止刷新后丢失
        localStorage.setItem('farm_last_player', currentPlayer);
        console.log(`切换到玩家${currentPlayer}`);
        
        // 隐藏账号选择界面
        accountSelectScreen.classList.add('hidden');
        
        // 标记游戏已开始
        localStorage.setItem('farm_started', 'true');
        
        // 加载新玩家数据（必须在显示视频前加载，确保数据正确）
        loadGame();
        
        // 显示视频层并播放
        videoLayer.classList.remove('hidden');
        introVideo.play().catch(err => {
            console.log('视频播放失败:', err);
            // 如果视频播放失败，直接进入游戏
            videoLayer.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            // 初始化订单系统
            ORDER_SYSTEM.initOrders();
            updateOrderBadge();
        });
    });
});

// 返回按钮点击事件
backToStartBtn.addEventListener('click', () => {
    accountSelectScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

// 背景音乐系统
const bgmFarm = document.getElementById('bgm-farm');
const bgmWorkshop = document.getElementById('bgm-workshop');
const musicToggle = document.getElementById('music-toggle');
const musicVolumePanel = document.getElementById('music-volume-panel');
const musicVolume = document.getElementById('music-volume');

// 当前播放的音乐
let currentBGM = null;
let musicMuted = false;
let musicVolumeLevel = 0.5;

// 初始化音乐设置
function initMusic() {
    // 从存档加载音量设置
    if (game.musicMuted !== undefined) {
        musicMuted = game.musicMuted;
    }
    if (game.musicVolume !== undefined) {
        musicVolumeLevel = game.musicVolume;
        musicVolume.value = musicVolumeLevel * 100;
    }

    // 设置音量
    bgmFarm.volume = musicVolumeLevel;
    bgmWorkshop.volume = musicVolumeLevel;

    // 更新按钮显示
    updateMusicButton();
}

// 播放主页面音乐
function playFarmMusic() {
    if (currentBGM === bgmFarm) return;

    // 淡出当前音乐
    if (currentBGM) {
        fadeOutMusic(currentBGM, () => {
            currentBGM = bgmFarm;
            if (!musicMuted) {
                fadeInMusic(bgmFarm);
            }
        });
    } else {
        currentBGM = bgmFarm;
        if (!musicMuted) {
            bgmFarm.play().catch(e => console.log('音乐播放失败:', e));
        }
    }
}

// 播放加工坊音乐
function playWorkshopMusic() {
    if (currentBGM === bgmWorkshop) return;

    // 淡出当前音乐
    if (currentBGM) {
        fadeOutMusic(currentBGM, () => {
            currentBGM = bgmWorkshop;
            if (!musicMuted) {
                fadeInMusic(bgmWorkshop);
            }
        });
    } else {
        currentBGM = bgmWorkshop;
        if (!musicMuted) {
            bgmWorkshop.play().catch(e => console.log('音乐播放失败:', e));
        }
    }
}

// 淡出音乐
function fadeOutMusic(audio, callback) {
    const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
            audio.volume -= 0.05;
        } else {
            clearInterval(fadeInterval);
            audio.pause();
            audio.volume = musicMuted ? 0 : musicVolumeLevel;
            if (callback) callback();
        }
    }, 50);
}

// 淡入音乐
function fadeInMusic(audio) {
    audio.volume = 0;
    audio.play().catch(e => console.log('音乐播放失败:', e));
    const fadeInterval = setInterval(() => {
        if (audio.volume < musicVolumeLevel - 0.05) {
            audio.volume += 0.05;
        } else {
            audio.volume = musicVolumeLevel;
            clearInterval(fadeInterval);
        }
    }, 50);
}

// 切换静音
function toggleMusic() {
    musicMuted = !musicMuted;

    if (musicMuted) {
        if (currentBGM) currentBGM.pause();
    } else {
        if (currentBGM) currentBGM.play().catch(e => console.log('音乐播放失败:', e));
    }

    updateMusicButton();
    saveMusicSettings();
}

// 更新音乐按钮显示
function updateMusicButton() {
    musicToggle.textContent = musicMuted ? '🔇' : '🔊';
}

// 保存音乐设置
function saveMusicSettings() {
    game.musicMuted = musicMuted;
    game.musicVolume = musicVolumeLevel;
    saveGame();
}

// 音量面板自动隐藏定时器
let volumePanelTimeout = null;

// 音乐按钮点击事件 - 切换静音并显示音量面板
musicToggle.addEventListener('click', () => {
    toggleMusic();

    // 显示音量面板
    musicVolumePanel.classList.remove('hidden');

    // 清除之前的定时器
    if (volumePanelTimeout) {
        clearTimeout(volumePanelTimeout);
    }

    // 3秒后自动隐藏
    volumePanelTimeout = setTimeout(() => {
        musicVolumePanel.classList.add('hidden');
    }, 3000);
});

// 音量滑块事件
musicVolume.addEventListener('input', () => {
    musicVolumeLevel = musicVolume.value / 100;
    if (currentBGM) currentBGM.volume = musicVolumeLevel;
    saveMusicSettings();

    // 如果正在静音状态，取消静音
    if (musicMuted) {
        musicMuted = false;
        updateMusicButton();
        if (currentBGM) currentBGM.play().catch(e => console.log('音乐播放失败:', e));
    }
});

// 视频播放结束后进入游戏
introVideo.addEventListener('ended', () => {
    videoLayer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    // 初始化订单系统
    ORDER_SYSTEM.initOrders();
    updateOrderBadge();

    // 开始播放主页面背景音乐
    initMusic();
    playFarmMusic();
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

        // 停止背景音乐
        if (currentBGM) {
            currentBGM.pause();
            currentBGM.currentTime = 0;
        }

        // 隐藏游戏主界面
        gameContainer.classList.add('hidden');

        // 显示结束动画层
        outroLayer.classList.remove('hidden');

        // 播放结束动画
        outroVideo.play().catch(err => {
            console.log('结束动画播放失败:', err);
            // 如果动画播放失败，清除标记并直接回到启动页
            localStorage.removeItem('farm_started');
            localStorage.removeItem('farm_last_player');
            currentPlayer = null;
            outroLayer.classList.add('hidden');
            startScreen.classList.remove('hidden');
        });
    });
});

// 结束动画播放结束后回到启动页
outroVideo.addEventListener('ended', () => {
    // 清除游戏已开始标记和当前玩家，下次刷新会显示启动页
    localStorage.removeItem('farm_started');
    localStorage.removeItem('farm_last_player');
    currentPlayer = null;

    outroLayer.classList.add('hidden');
    startScreen.classList.remove('hidden');

    // 重置背景音乐状态
    currentBGM = null;
});

