from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    margin = size // 8
    key_rect = [margin, margin, size - margin, size - margin]
    draw.rounded_rectangle(key_rect, radius=size//10, fill=(70, 130, 180, 255), outline=(50, 100, 150, 255), width=2)
    
    try:
        font_size = size // 2
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', font_size)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), 'S', font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]
    
    draw.text((x, y), 'S', fill=(255, 255, 255, 255), font=font)
    
    img.save(filename)
    print(f'Created {filename}')

create_icon(16, 'icon16.png')
create_icon(48, 'icon48.png')
create_icon(128, 'icon128.png')
