"""
Intersolar Pre-Event Buzz 单图优化版
解决文字重叠问题
"""

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyBboxPatch

# 设置样式
plt.style.use('default')
fig, ax = plt.subplots(figsize=(14, 8))

# 数据
years = ['2023', '2024', '2025']
totals = [2573, 4404, 8280]
event_dates = ['Jun 14-16\n(Apr-May)', 'Jun 19-21\n(Apr-May)', 'May 7-9\n(Mar-Apr)']
colors = ['#2E5C8A', '#5A9A4D', '#D35400']  # 深蓝、绿、橙红

# 计算增长率
growth_2024 = ((4404 - 2573) / 2573) * 100
growth_2025 = ((8280 - 4404) / 4404) * 100
growth_total = ((8280 - 2573) / 2573) * 100

# 绘制柱状图 - 增加柱子间距
x_pos = np.array([0, 2.5, 5])  # 增加间距
bars = ax.bar(x_pos, totals, color=colors, edgecolor='black', linewidth=1.5, width=1.5)

# 主标题
ax.set_title('Intersolar Pre-Event Buzz: 88% Growth in 2025',
             fontsize=20, fontweight='bold', pad=25)

# 副标题
ax.text(0.5, 1.02, '(Mentions in 2 months leading up to the event)',
        transform=ax.transAxes, ha='center', fontsize=13, style='italic')

# 在柱子上添加大数值
for i, (bar, total, year) in enumerate(zip(bars, totals, years)):
    height = bar.get_height()
    # 数值标签 - 放在柱子上方
    ax.text(bar.get_x() + bar.get_width()/2., height + 250,
            f'{total:,}',
            ha='center', va='bottom', fontsize=22, fontweight='bold')

# X轴标签 - 放在图表底部
for i, (x, year, date) in enumerate(zip(x_pos, years, event_dates)):
    # Intersolar 年份
    ax.text(x, -1200, f'Intersolar {year}',
            ha='center', va='top', fontsize=13, fontweight='bold')
    # 展会日期和周期
    ax.text(x, -1550, date,
            ha='center', va='top', fontsize=11, color='#555555')

# 绘制增长率箭头和标签
# 2023 -> 2024
arrow_x1 = (x_pos[0] + x_pos[1]) / 2
ax.annotate('', xy=(x_pos[1] - 0.9, bars[1].get_height() - 500),
            xytext=(x_pos[0] + 0.9, bars[0].get_height() + 500),
            arrowprops=dict(arrowstyle='->', color='#E74C3C', lw=2.5))
ax.text(arrow_x1, 4800, f'+{growth_2024:.0f}%',
        ha='center', va='center', fontsize=14, fontweight='bold',
        color='#E74C3C',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#FFE5E5',
                  edgecolor='#E74C3C', linewidth=2))

# 2024 -> 2025
arrow_x2 = (x_pos[1] + x_pos[2]) / 2
ax.annotate('', xy=(x_pos[2] - 0.9, bars[2].get_height() - 500),
            xytext=(x_pos[1] + 0.9, bars[1].get_height() + 500),
            arrowprops=dict(arrowstyle='->', color='#E74C3C', lw=2.5))
ax.text(arrow_x2, 6800, f'+{growth_2025:.0f}%',
        ha='center', va='center', fontsize=14, fontweight='bold',
        color='#E74C3C',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#FFE5E5',
                  edgecolor='#E74C3C', linewidth=2))

# 总增长标注 - 右上角
ax.text(5.8, 9200, f'+{growth_total:.0f}%\nvs 2023',
        ha='center', va='center', fontsize=12, fontweight='bold',
        color='#C0392B',
        bbox=dict(boxstyle='round,pad=0.4', facecolor='#FDEDEC',
                  edgecolor='#C0392B', linewidth=2))

# Y轴设置
ax.set_ylabel('Media Mentions (2 months before event)',
              fontsize=13, fontweight='bold', labelpad=10)
ax.set_ylim(0, 10500)
ax.set_yticks([0, 2000, 4000, 6000, 8000, 10000])

# X轴隐藏刻度，使用自定义标签
ax.set_xticks([])
ax.set_xlim(-1, 6.5)

# 网格
ax.grid(True, alpha=0.3, axis='y', linestyle='--')

# 数据来源 - 底部居中
fig.text(0.5, 0.02, 'Data source: Cision One | Pre-event period = 2 months before Intersolar',
         ha='center', fontsize=10, style='italic', color='#666666')

# 调整布局
plt.tight_layout()
plt.subplots_adjust(bottom=0.18, top=0.88)

plt.savefig('intersolar_single_chart.png', dpi=300, bbox_inches='tight',
            facecolor='white', pad_inches=0.3)
plt.show()

print("\n图表已生成：intersolar_single_chart.png")
print(f"核心数据：2025年展前2个月声量 {totals[2]:,}，同比增长 +{growth_2025:.0f}%")
