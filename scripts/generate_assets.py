from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def vertical_gradient(size, top_color, bottom_color):
    width, height = size
    image = Image.new("RGBA", size)
    draw = ImageDraw.Draw(image)
    for y in range(height):
        ratio = y / max(height - 1, 1)
        color = tuple(
            int(top_color[index] + (bottom_color[index] - top_color[index]) * ratio)
            for index in range(3)
        ) + (255,)
        draw.line((0, y, width, y), fill=color)
    return image


def add_orb(base, xy, radius, color):
    orb = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(orb)
    x, y = xy
    for step in range(radius, 0, -1):
        alpha = int(120 * (step / radius) ** 2)
        fill = (*color, alpha)
        draw.ellipse((x - step, y - step, x + step, y + step), fill=fill)
    base.alpha_composite(orb)


def rounded_panel(base, box, fill, outline):
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(box, radius=32, fill=fill, outline=outline, width=2)


def draw_wolf_mark(base, origin, scale=1.0):
    ox, oy = origin
    shape = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shape)
    cyan = (79, 209, 255, 255)
    purple = (138, 125, 255, 255)
    mint = (93, 255, 207, 255)

    outer = [
        (ox + 90 * scale, oy + 8 * scale),
        (ox + 128 * scale, oy + 26 * scale),
        (ox + 146 * scale, oy + 61 * scale),
        (ox + 138 * scale, oy + 111 * scale),
        (ox + 98 * scale, oy + 162 * scale),
        (ox + 52 * scale, oy + 155 * scale),
        (ox + 20 * scale, oy + 112 * scale),
        (ox + 24 * scale, oy + 62 * scale),
        (ox + 51 * scale, oy + 25 * scale),
    ]
    draw.polygon(outer, fill=cyan)

    inner = [
        (ox + 94 * scale, oy + 32 * scale),
        (ox + 119 * scale, oy + 44 * scale),
        (ox + 127 * scale, oy + 71 * scale),
        (ox + 113 * scale, oy + 98 * scale),
        (ox + 88 * scale, oy + 111 * scale),
        (ox + 64 * scale, oy + 101 * scale),
        (ox + 52 * scale, oy + 73 * scale),
        (ox + 60 * scale, oy + 45 * scale),
    ]
    draw.polygon(inner, fill=(7, 17, 31, 255))
    draw.polygon(
        [
            (ox + 75 * scale, oy + 55 * scale),
            (ox + 91 * scale, oy + 65 * scale),
            (ox + 84 * scale, oy + 83 * scale),
            (ox + 67 * scale, oy + 83 * scale),
            (ox + 59 * scale, oy + 69 * scale),
        ],
        fill=cyan,
    )
    draw.polygon(
        [
            (ox + 98 * scale, oy + 54 * scale),
            (ox + 116 * scale, oy + 63 * scale),
            (ox + 107 * scale, oy + 83 * scale),
            (ox + 90 * scale, oy + 83 * scale),
            (ox + 83 * scale, oy + 69 * scale),
        ],
        fill=purple,
    )
    draw.polygon(
        [
            (ox + 64 * scale, oy + 117 * scale),
            (ox + 89 * scale, oy + 103 * scale),
            (ox + 111 * scale, oy + 117 * scale),
            (ox + 94 * scale, oy + 136 * scale),
            (ox + 74 * scale, oy + 136 * scale),
        ],
        fill=mint,
    )
    draw.polygon(
        [
            (ox + 138 * scale, oy + 111 * scale),
            (ox + 160 * scale, oy + 95 * scale),
            (ox + 170 * scale, oy + 111 * scale),
            (ox + 149 * scale, oy + 130 * scale),
        ],
        fill=cyan,
    )
    draw.polygon(
        [
            (ox + 24 * scale, oy + 62 * scale),
            (ox + 7 * scale, oy + 49 * scale),
            (ox + 13 * scale, oy + 76 * scale),
            (ox + 20 * scale, oy + 112 * scale),
            (ox + 36 * scale, oy + 99 * scale),
        ],
        fill=purple,
    )
    draw.ellipse(
        (
            ox + 98 * scale,
            oy + 67 * scale,
            ox + 108 * scale,
            oy + 77 * scale,
        ),
        fill=(233, 243, 255, 255),
    )

    base.alpha_composite(shape)


def save_og():
    image = vertical_gradient((1200, 630), (6, 14, 28), (3, 7, 15))
    add_orb(image, (190, 140), 180, (79, 209, 255))
    add_orb(image, (1010, 120), 165, (138, 125, 255))

    grid = Image.new("RGBA", image.size, (0, 0, 0, 0))
    grid_draw = ImageDraw.Draw(grid)
    for y in range(88, 630, 90):
      grid_draw.line((0, y, 1200, y), fill=(215, 233, 255, 22), width=1)
    for x in range(86, 1200, 150):
      grid_draw.line((x, 0, x, 630), fill=(215, 233, 255, 22), width=1)
    image.alpha_composite(grid)

    draw_wolf_mark(image, (110, 145), 1.15)

    draw = ImageDraw.Draw(image)
    draw.text((360, 214), "avantelabs", font=font(FONT_BOLD, 92), fill=(233, 243, 255))
    draw.text(
        (363, 315),
        "SOLUCOES DIGITAIS E TECNOLOGIA",
        font=font(FONT_BOLD, 24),
        fill=(93, 255, 207),
    )
    draw.text(
        (363, 408),
        "Criamos solucoes digitais que transformam operacoes,",
        font=font(FONT_BOLD, 40),
        fill=(233, 243, 255),
    )
    draw.text(
        (363, 460),
        "conectam mercados e impulsionam negocios para o futuro.",
        font=font(FONT_BOLD, 40),
        fill=(233, 243, 255),
    )
    draw.text(
        (363, 532),
        "avantelabs.com.br",
        font=font(FONT_REGULAR, 28),
        fill=(159, 177, 201),
    )

    image.convert("RGB").save(ASSETS / "avantelabs-og.png", quality=95)


def save_system_logo(filename, title, subtitle, colors, icon):
    image = Image.new("RGBA", (560, 200), (10, 21, 39, 255))
    rounded_panel(image, (2, 2, 558, 198), (10, 21, 39, 255), colors[0])
    draw = ImageDraw.Draw(image)

    if icon == "agro":
        draw.rounded_rectangle((40, 49, 158, 153), radius=52, fill=colors[0])
        draw.line((84, 76, 98, 104, 118, 85, 134, 123), fill=(233, 243, 255), width=8, joint="curve")
    elif icon == "repor":
        draw.rounded_rectangle((45, 52, 147, 148), radius=24, fill=colors[1])
        draw.text((78, 73), "R", font=font(FONT_BOLD, 64), fill=(7, 17, 31))
        draw.line((74, 143, 119, 143), fill=(233, 243, 255), width=6)
    else:
        draw.ellipse((43, 46, 151, 154), fill=colors[0])
        draw.pieslice((83, 74, 111, 102), 180, 360, fill=(7, 17, 31))
        draw.arc((72, 104, 122, 142), 200, 340, fill=(7, 17, 31), width=8)

    draw.text((188, 72), title, font=font(FONT_BOLD, 40), fill=(233, 243, 255))
    draw.text((188, 124), subtitle, font=font(FONT_BOLD, 18), fill=(159, 177, 201))
    image.convert("RGB").save(ASSETS / filename, quality=95)


if __name__ == "__main__":
    ASSETS.mkdir(exist_ok=True)
    save_og()
    save_system_logo(
        "logo-agrometrica.png",
        "AgroMetrica",
        "CONTROLE INTELIGENTE PARA O AGRO",
        ((79, 209, 255), (93, 255, 207)),
        "agro",
    )
    save_system_logo(
        "logo-repor.png",
        "Repor",
        "REPOSICAO COM RITMO E CONTROLE",
        ((138, 125, 255), (79, 209, 255)),
        "repor",
    )
    save_system_logo(
        "logo-fidelizee.png",
        "Fidelizee",
        "RELACIONAMENTO DIGITAL COM CLIENTES",
        ((93, 255, 207), (79, 209, 255)),
        "fidelizee",
    )
