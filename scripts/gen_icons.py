from PIL import Image, ImageDraw, ImageFont

BG = (35, 44, 77)      # #232C4D
FG = (255, 255, 255)

def make_icon(size, out_path, radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(size * radius_ratio)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=BG)

    font_path = "C:/Windows/Fonts/msjh.ttc"
    font_size = int(size * 0.58)
    font = ImageFont.truetype(font_path, font_size)
    text = "字"
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]
    draw.text((x, y), text, font=font, fill=FG)

    img.save(out_path, "PNG")
    print("saved", out_path, size)

make_icon(192, "icons/icon-192.png")
make_icon(512, "icons/icon-512.png")
make_icon(180, "icons/apple-touch-icon.png", radius_ratio=0)  # apple applies its own mask
