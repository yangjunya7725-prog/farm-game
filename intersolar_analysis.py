"""
Intersolar展会媒体声量三年对比分析
数据来源：Cision One平台
"""

import matplotlib.pyplot as plt
import numpy as np

# 设置样式
plt.style.use('default')
plt.rcParams['font.size'] = 10
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['axes.labelsize'] = 10

# 数据准备
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
x = np.arange(len(months))

# Online媒体数据（主力）
online_2023 = [694, 1606, 498, 844, 1729, 17722, 2511, 3488, 3124, 1275, 1696, 1597]
online_2024 = [2760, 1003, 1332, 906, 3498, 25902, 2018, 2449, 2909, 498, 1113, 376]
online_2025 = [1416, 3727, 2341, 5939, 22635, 3012, 728, 2164, 1622, 666, 412, 346]

# 计算年度总量
total_2023 = sum(online_2023)
total_2024 = sum(online_2024)
total_2025 = sum(online_2025)

# 2024年和2025年全渠道数据（用于构成分析）
media_2024 = {
    'Online': sum([2760, 1003, 1332, 906, 3498, 25902, 2018, 2449, 2909, 498, 1113, 376]),
    'Print': sum([11, 6, 6, 4, 14, 80, 1, 19, 25, 6, 21, 3]),
    'TV': sum([0, 0, 4, 1, 1, 26, 1, 0, 0, 0, 4, 0]),
    'Radio': sum([2, 8, 8, 3, 6, 46, 2, 4, 1, 4, 3, 7]),
    'Magazine': sum([1, 6, 0, 2, 7, 6, 6, 2, 3, 2, 1, 1]),
    'Podcast': sum([9, 11, 5, 2, 2, 11, 3, 1, 1, 0, 1, 0])
}

media_2025 = {
    'Online': sum([1416, 3727, 2341, 5939, 22635, 3012, 728, 2164, 1622, 666, 412, 346]),
    'Print': sum([9, 21, 10, 16, 32, 2, 7, 19, 14, 3, 7, 6]),
    'TV': sum([1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]),
    'Radio': sum([1, 4, 6, 4, 38, 1, 8, 4, 3, 48, 2, 4]),
    'Magazine': sum([2, 3, 1, 6, 5, 1, 1, 1, 4, 0, 0, 1]),
    'Podcast': sum([2, 1, 1, 1, 7, 2, 2, 1, 4, 0, 2, 0])
}

# 创建大图
fig = plt.figure(figsize=(18, 10))

# ========== 图1：三年Online声量趋势对比 ==========
ax1 = plt.subplot(2, 3, (1, 2))
colors = ['#4A90A4', '#7FB069', '#E6A23C']
ax1.plot(x, online_2023, marker='o', linewidth=2.5, markersize=6, label='2023', color=colors[0])
ax1.plot(x, online_2024, marker='s', linewidth=2.5, markersize=6, label='2024', color=colors[1])
ax1.plot(x, online_2025, marker='^', linewidth=2.5, markersize=6, label='2025', color=colors[2])

# 标注展会峰值
ax1.annotate(f'2023 Peak\n{online_2023[5]:,}', xy=(5, online_2023[5]), xytext=(3, 21000),
            arrowprops=dict(arrowstyle='->', color=colors[0]), fontsize=9, ha='center')
ax1.annotate(f'2024 Peak\n{online_2024[5]:,}', xy=(5, online_2024[5]), xytext=(7, 28500),
            arrowprops=dict(arrowstyle='->', color=colors[1]), fontsize=9, ha='center')
ax1.annotate(f'2025 May\n{online_2025[4]:,}', xy=(4, online_2025[4]), xytext=(2.5, 26000),
            arrowprops=dict(arrowstyle='->', color='#D9534F'), fontsize=9, ha='center', color='#D9534F')

ax1.set_xlabel('Month', fontsize=11)
ax1.set_ylabel('Media Mentions', fontsize=11)
ax1.set_title('Intersolar Online Media Mentions: 3-Year Trend Comparison', fontsize=13, fontweight='bold', pad=15)
ax1.set_xticks(x)
ax1.set_xticklabels(months)
ax1.legend(loc='upper left', fontsize=10)
ax1.grid(True, alpha=0.3)

# 添加增长标注
growth_2024 = ((total_2024 - total_2023) / total_2023) * 100
ax1.text(0.02, 0.98, f'2024 YoY Growth: +{growth_2024:.1f}%', transform=ax1.transAxes,
         fontsize=10, verticalalignment='top', bbox=dict(boxstyle='round', facecolor='#7FB069', alpha=0.3))

# ========== 图2：年度总量对比 ==========
ax2 = plt.subplot(2, 3, 3)
years = ['2023', '2024', '2025*']
totals = [total_2023, total_2024, total_2025]
bars = ax2.bar(years, totals, color=colors, edgecolor='black', linewidth=1.2)

# 添加数值标签
for bar, total in zip(bars, totals):
    height = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2., height,
             f'{total:,}',
             ha='center', va='bottom', fontsize=11, fontweight='bold')

ax2.set_ylabel('Total Online Mentions', fontsize=11)
ax2.set_title('Annual Online Volume Comparison', fontsize=13, fontweight='bold', pad=15)
ax2.set_ylim(0, max(totals) * 1.15)
ax2.text(0.5, 0.95, '*2025 data may have collection limitations', transform=ax2.transAxes,
         fontsize=8, ha='center', va='top', style='italic', color='gray')

# ========== 图3：展会周期聚焦（4-7月） ==========
ax3 = plt.subplot(2, 3, 4)
focus_months = ['Apr', 'May', 'Jun', 'Jul']
focus_x = np.arange(len(focus_months))
width = 0.25

focus_2023 = [844, 1729, 17722, 2511]
focus_2024 = [906, 3498, 25902, 2018]
focus_2025 = [5939, 22635, 3012, 728]

bars1 = ax3.bar(focus_x - width, focus_2023, width, label='2023', color=colors[0], edgecolor='black')
bars2 = ax3.bar(focus_x, focus_2024, width, label='2024', color=colors[1], edgecolor='black')
bars3 = ax3.bar(focus_x + width, focus_2025, width, label='2025', color=colors[2], edgecolor='black')

ax3.set_xlabel('Month', fontsize=11)
ax3.set_ylabel('Media Mentions', fontsize=11)
ax3.set_title('Event Period Focus (Apr-Jul)', fontsize=13, fontweight='bold', pad=15)
ax3.set_xticks(focus_x)
ax3.set_xticklabels(focus_months)
ax3.legend(fontsize=9)
ax3.grid(True, alpha=0.3, axis='y')

# 添加增长率标注
growth_may = ((22635 - 3498) / 3498) * 100
ax3.text(0.5, 0.95, f'2025 May YoY: +{growth_may:.0f}%', transform=ax3.transAxes,
         fontsize=9, ha='center', va='top', bbox=dict(boxstyle='round', facecolor='#E6A23C', alpha=0.3))

# ========== 图4：2024年媒体构成 ==========
ax4 = plt.subplot(2, 3, 5)
labels_2024 = list(media_2024.keys())
sizes_2024 = list(media_2024.values())
colors_pie = ['#4A90A4', '#7FB069', '#E6A23C', '#D9534F', '#9B59B6', '#34495E']
explode = (0.05, 0, 0, 0, 0, 0)

wedges, texts, autotexts = ax4.pie(sizes_2024, labels=labels_2024, autopct='%1.1f%%',
                                   colors=colors_pie, explode=explode, startangle=90,
                                   textprops={'fontsize': 9})
for autotext in autotexts:
    autotext.set_fontsize(8)
    autotext.set_fontweight('bold')
ax4.set_title('2024 Media Type Distribution', fontsize=13, fontweight='bold', pad=15)

# ========== 图5：2025年媒体构成 ==========
ax5 = plt.subplot(2, 3, 6)
labels_2025 = list(media_2025.keys())
sizes_2025 = list(media_2025.values())

wedges, texts, autotexts = ax5.pie(sizes_2025, labels=labels_2025, autopct='%1.1f%%',
                                   colors=colors_pie, explode=explode, startangle=90,
                                   textprops={'fontsize': 9})
for autotext in autotexts:
    autotext.set_fontsize(8)
    autotext.set_fontweight('bold')
ax5.set_title('2025 Media Type Distribution', fontsize=13, fontweight='bold', pad=15)

plt.tight_layout(pad=3.0)
plt.savefig('intersolar_analysis.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.show()

print("\n" + "="*70)
print("INTERSOLAR MEDIA MENTIONS ANALYSIS - KEY INSIGHTS")
print("="*70)
print(f"\n[Annual Online Volume Comparison]")
print(f"  2023 Total: {total_2023:,} mentions")
print(f"  2024 Total: {total_2024:,} mentions (YoY +{growth_2024:.1f}%)")
print(f"  2025 Total: {total_2025:,} mentions*")
print(f"\n[Event Peak Comparison]")
print(f"  2023 June Peak: {online_2023[5]:,} mentions")
print(f"  2024 June Peak: {online_2024[5]:,} mentions (growth +{((online_2024[5]-online_2023[5])/online_2023[5]*100):.0f}%)")
print(f"  2025 May Peak:  {online_2025[4]:,} mentions (pre-event surge)")
print(f"\n[2025 Anomaly Insights]")
print(f"  May 2025 vs May 2024: +{((22635-3498)/3498)*100:.0f}% YoY growth")
print(f"  June 2025 vs June 2024: {((3012-25902)/25902)*100:.0f}% decline (verify data cutoff)")
print(f"\n* 2025 data may have collection cutoff limitations")
print("="*70)
