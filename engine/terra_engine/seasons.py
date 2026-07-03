def season_of(date):
    if date.month >= 9:
        return f"{date.year + 1}A"
    if date.month <= 2:
        return f"{date.year}A"
    if date.month <= 6:
        return f"{date.year}B"
    return f"{date.year}C"
