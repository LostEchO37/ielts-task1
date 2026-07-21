#!/usr/bin/env python3
"""Generate static-chart PNG assets for the IELTS Task 1 static module."""

import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "charts", "static")
QUIZ = os.path.join(OUT, "quiz")
SIM = os.path.join(OUT, "sim")

for d in (OUT, QUIZ, SIM):
    os.makedirs(d, exist_ok=True)

plt.rcParams.update({
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "font.size": 10,
    "axes.titlesize": 11,
    "axes.labelsize": 10,
})


def save(fig, path):
    fig.savefig(path, dpi=140, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("wrote", path)


def table_gender_age(path):
    fig, ax = plt.subplots(figsize=(6.2, 3.2))
    ax.axis("off")
    cols = ["<20", "20–30", ">30"]
    rows = ["Male", "Female"]
    data = [[20, 20, 10], [30, 11, 9]]
    table = ax.table(
        cellText=data, rowLabels=rows, colLabels=cols,
        loc="center", cellLoc="center"
    )
    table.scale(1.2, 1.8)
    table.auto_set_font_size(False)
    table.set_fontsize(11)
    ax.set_title("Participants by gender and age group", pad=16, fontweight="bold")
    save(fig, path)


def bar_transport(path, title="Preferred transport modes in City X (2023)"):
    fig, ax = plt.subplots(figsize=(6.5, 4))
    modes = ["Car", "Bus", "Cycle", "Walk", "Rail"]
    vals = [42, 28, 15, 10, 5]
    colors = ["#1e4d6b", "#2a6f8f", "#c45c3e", "#6b4d9e", "#5c6478"]
    ax.bar(modes, vals, color=colors, edgecolor="white", linewidth=0.8)
    ax.set_ylabel("Percentage (%)")
    ax.set_ylim(0, 50)
    ax.set_title(title, fontweight="bold", pad=10)
    ax.grid(axis="y", alpha=0.25)
    save(fig, path)


def pie_energy(path):
    fig, ax = plt.subplots(figsize=(5.5, 4.5))
    labels = ["Coal", "Gas", "Nuclear", "Renewables", "Oil"]
    sizes = [35, 28, 18, 12, 7]
    colors = ["#4a4a4a", "#2a6f8f", "#c45c3e", "#6b9479", "#8b6914"]
    ax.pie(sizes, labels=labels, autopct="%1.0f%%", startangle=90, colors=colors,
           textprops={"fontsize": 9})
    ax.set_title("Energy sources in Country Y (2022)", fontweight="bold")
    save(fig, path)


def grouped_bar_spending(path):
    fig, ax = plt.subplots(figsize=(7, 4.2))
    cats = ["Food", "Housing", "Transport", "Leisure"]
    men = [22, 30, 18, 12]
    women = [26, 28, 14, 16]
    x = np.arange(len(cats))
    w = 0.35
    ax.bar(x - w/2, men, w, label="Men", color="#1e4d6b")
    ax.bar(x + w/2, women, w, label="Women", color="#c45c3e")
    ax.set_xticks(x)
    ax.set_xticklabels(cats)
    ax.set_ylabel("Average weekly spending (£)")
    ax.set_title("Household spending by gender", fontweight="bold")
    ax.legend()
    ax.grid(axis="y", alpha=0.25)
    save(fig, path)


def table_countries(path):
    fig, ax = plt.subplots(figsize=(6.5, 3.4))
    ax.axis("off")
    cols = ["Country A", "Country B", "Country C", "Country D"]
    rows = ["Production", "Consumption", "Export"]
    data = [[120, 95, 80, 60], [100, 110, 75, 55], [20, 15, 30, 10]]
    table = ax.table(cellText=data, rowLabels=rows, colLabels=cols, loc="center", cellLoc="center")
    table.scale(1.15, 1.7)
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    ax.set_title("Milk statistics (million tonnes)", pad=14, fontweight="bold")
    save(fig, path)


def horizontal_bar(path):
    fig, ax = plt.subplots(figsize=(6.5, 4))
    items = ["Reading", "Sports", "Music", "Travel", "Cooking"]
    vals = [32, 27, 18, 14, 9]
    ax.barh(items, vals, color="#2a6f8f")
    ax.set_xlabel("Percentage of respondents (%)")
    ax.set_title("Leisure activities survey", fontweight="bold")
    ax.grid(axis="x", alpha=0.25)
    save(fig, path)


# Lesson & quiz charts
table_gender_age(os.path.join(OUT, "step2-table.png"))
bar_transport(os.path.join(OUT, "step1-bar.png"))
bar_transport(os.path.join(QUIZ, "q-step1-bar.png"))
table_gender_age(os.path.join(QUIZ, "q-step2-table.png"))
table_gender_age(os.path.join(QUIZ, "q-step3-table.png"))
grouped_bar_spending(os.path.join(QUIZ, "q-bonus-grouped.png"))
pie_energy(os.path.join(QUIZ, "q-bonus-pie.png"))
table_countries(os.path.join(QUIZ, "q-formulas-table.png"))

# Simulations
bar_transport(os.path.join(SIM, "static-sim1.png"), "Transport modes in Riverside (2023)")
pie_energy(os.path.join(SIM, "static-sim2.png"))
table_countries(os.path.join(SIM, "static-sim3.png"))
horizontal_bar(os.path.join(SIM, "static-sim-extra.png"))

print("Done.")
