"""
Intersolar展会展前2个月声量分析
突出2025年展前预热效果显著增长
"""

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle
import matplotlib.patches as mpatches

# 设置样式
plt.style.use('default')
plt.rcParams['font.size'] = 10
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['axes.labelsize'] = 10

# ========== 数据准备 ==========
# 展前2个月声量对比（最亮眼的口径）
pre_event_data = {
    '2023': {
        'months': ['Apr', 'May'],
        'values': [844, 1729],
        'total': 2573,
        'event_date': 'Jun 14-16',
        'period': 'Apr-May'
    },
    '2024': {
        'months': ['Apr', 'May'],
        'values': [906, 3498],
        'total': 4404,
        'event_date': 'Jun 19-21',
        'period': 'Apr-May'
    },
    '2025': {
        'months': ['Mar', 'Apr'],
        'values': [2341, 5939],
        'total': 8280,
        'event_date': 'May 7-9',
        'period': 'Mar-Apr'
    }
}

# 增长率计算
growth_2024 = ((4404 - 2573) / 2573) * 100  # +71%
growth_2025 = ((8280 - 4404) / 4404) * 100  # +88%
growth_2025_vs_2023 = ((8280 - 2573) / 2573) * 100  # +222%

# 全年详细数据（用于趋势图）
months_full = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
online_2023 = [694, 1606, 498, 844, 1729, 17722, 2511, 3488, 3124, 1275, 1696, 1597]
online_2024 = [2760, 1003, 1332, 906, 3498, 25902, 2018, 2449, 2909, 498, 1113, 376]
online_2025 = [1416, 3727, 2341, 5939, 22635, 3012, 728, 2164, 1622, 666, 412, 346]

# ========== 创建图表 ==========
fig = plt.figure(figsize=(18, 12))

# ========== 图1：展前2个月声量对比（主推图）==========
ax1 = plt.subplot(2, 2, (1, 2))

years = ['2023', '2024', '2025']
totals = [2573, 4404, 8280]
colors = ['#4A90A4', '#7FB069', '#E67E22']  # 蓝、绿、橙（突出2025）

# 绘制柱状图
bars = ax1.bar(years, totals, color=colors, edgecolor='black', linewidth=1.5, width=0.6)

# 在柱子上添加数值和增长率
for i, (bar, total, year) in enumerate(zip(bars, totals, years)):
    height = bar.get_height()
    # 数值标签
    ax1.text(bar.get_x() + bar.get_width()/2., height + 200,
             f'{total:,}',
             ha='center', va='bottom', fontsize=20, fontweight='bold')

    # 展会日期标签
    event_date = pre_event_data[year]['event_date']
    period = pre_event_data[year]['period']
    ax1.text(bar.get_x() + bar.get_width()/2., -800,
             f'Intersolar {year}\n{event_date}\n({period})',
             ha='center', va='top', fontsize=11, fontweight='bold')

    # 增长率箭头（2024和2025）
    if i > 0:
        prev_height = bars[i-1].get_height()
        curr_height = bar.get_height()
        growth = ((curr_height - prev_height) / prev_height) * 100

        # 绘制箭头
        arrow_x = bar.get_x() - 0.3
        arrow_y_start = prev_height + 300
        arrow_y_end = curr_height - 300

        ax1.annotate('', xy=(arrow_x, arrow_y_end), xytext=(arrow_x, arrow_y_start),
                    arrowprops=dict(arrowstyle='->', color='red', lw=2))

        # 增长率标签
        ax1.text(arrow_x - 0.15, (arrow_y_start + arrow_y_end)/2,
                f'+{growth:.0f}%',
                ha='right', va='center', fontsize=14, fontweight='bold',
                color='red', bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.8))

# 2025 vs 2023 总增长
ax1.text(2, 9500, f'+222%\nvs 2023', ha='center', va='bottom',
         fontsize=14, fontweight='bold', color='red',
         bbox=dict(boxstyle='round', facecolor='#ffcccc', alpha=0.8))

ax1.set_ylabel('Media Mentions (2 months before event)', fontsize=12, fontweight='bold')
ax1.set_title('Intersolar Pre-Event Buzz: 88% Growth in 2025\n(Mentions in 2 months leading up to the event)',
              fontsize=16, fontweight='bold', pad=20)
ax1.set_ylim(0, 11000)
ax1.grid(True, alpha=0.3, axis='y')
ax1.set_xticks([])  # 隐藏x轴标签，用自定义文本替代

# 添加图例说明
legend_text = 'Data source: Cision One | Pre-event period = 2 months before Intersolar'
ax1.text(0.5, -0.12, legend_text, transform=ax1.transAxes,
         ha='center', fontsize=9, style='italic', color='gray')

# ========== 图2：展前2个月月度细分对比 ==========
ax2 = plt.subplot(2, 2, 3)

x = np.arange(2)
width = 0.25

# 2023年数据（Apr-May）
ax2.bar(x - width, [844, 1729], width, label='2023 (Apr-May)', color=colors[0], edgecolor='black')
# 2024年数据（Apr-May）
ax2.bar(x, [906, 3498], width, label='2024 (Apr-May)', color=colors[1], edgecolor='black')
# 2025年数据（Mar-Apr）
ax2.bar(x + width, [2341, 5939], width, label='2025 (Mar-Apr)', color=colors[2], edgecolor='black')

ax2.set_ylabel('Media Mentions', fontsize=11)
ax2.set_title('Month-by-Month Breakdown\n(2 months before event)', fontsize=13, fontweight='bold')
ax2.set_xticks(x)
ax2.set_xticklabels(['Month -2', 'Month -1'])
ax2.legend(loc='upper left')
ax2.grid(True, alpha=0.3, axis='y')

# 添加数值标签
for container in ax2.containers:
    ax2.bar_label(container, fmt='%d', fontsize=9)

# ========== 图3：三年完整趋势 + 展会日期标注 ==========
ax3 = plt.subplot(2, 2, 4)

x_full = np.arange(12)

# 绘制三条线
ax3.plot(x_full, online_2023, marker='o', linewidth=2, markersize=4,
         label='2023', color=colors[0], alpha=0.8)
ax3.plot(x_full, online_2024, marker='s', linewidth=2, markersize=4,
         label='2024', color=colors[1], alpha=0.8)
ax3.plot(x_full, online_2025, marker='^', linewidth=2.5, markersize=5,
         label='2025', color=colors[2], alpha=1.0)

# 标注展会日期
# 2023: 6月14-16日 -> 约x=5.5
ax3.axvspan(4, 6, alpha=0.2, color=colors[0], label='_nolegend_')
ax3.annotate('Intersolar 2023\nJun 14-16', xy=(5.5, 17722), xytext=(7, 22000),
            arrowprops=dict(arrowstyle='->', color=colors[0]),
            fontsize=9, ha='center', color=colors[0], fontweight='bold')

# 2024: 6月19-21日 -> 约x=5.6
ax3.axvspan(4, 6, alpha=0.2, color=colors[1], label='_nolegend_')
ax3.annotate('Intersolar 2024\nJun 19-21', xy=(5.6, 25902), xytext=(8, 28000),
            arrowprops=dict(arrowstyle='->', color=colors[1]),
            fontsize=9, ha='center', color=colors[1], fontweight='bold')

# 2025: 5月7-9日 -> 约x=4.2
ax3.axvspan(2, 4, alpha=0.2, color=colors[2], label='_nolegend_')
ax3.annotate('Intersolar 2025\nMay 7-9', xy=(4.2, 22635), xytext=(2, 26000),
            arrowprops=dict(arrowstyle='->', color=colors[2]),
            fontsize=9, ha='center', color=colors[2], fontweight='bold')

# 标注展前2个月区间
ax3.axvspan(2, 4, alpha=0.1, color='red', label='_nolegend_')
ax3.text(3, 15000, '2025 Pre-event\n2 months', ha='center', fontsize=9,
         color='red', fontweight='bold',
         bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

ax3.set_xlabel('Month', fontsize=11)
ax3.set_ylabel('Media Mentions', fontsize=11)
ax3.set_title('Full-Year Trend with Event Dates\n(Shaded = event period, Red = 2025 pre-event 2 months)',
              fontsize=13, fontweight='bold')
ax3.set_xticks(x_full)
ax3.set_xticklabels(months_full, rotation=45)
ax3.legend(loc='upper right')
ax3.grid(True, alpha=0.3)

plt.tight_layout(pad=3.0)
plt.savefig('intersolar_pre_event_analysis.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.show()

# 打印关键洞察
print("\n" + "="*70)
print("INTERSOLAR PRE-EVENT BUZZ ANALYSIS")
print("2 Months Before Event Comparison")
print("="*70)
print(f"\n[Key Finding] 2025 Pre-Event Buzz Surge")
print(f"  2023 (Apr-May): {2573:,} mentions")
print(f"  2024 (Apr-May): {4404:,} mentions (+{growth_2024:.0f}% YoY)")
print(f"  2025 (Mar-Apr): {8280:,} mentions (+{growth_2025:.0f}% YoY) ⭐")
print(f"\n  vs 2023 baseline: +{growth_2025_vs_2023:.0f}% total growth")
print(f"\n  2025 event date: May 7-9 (earlier than previous years)")
print(f"  => Pre-event period shifted to Mar-Apr")
print("="*70)
