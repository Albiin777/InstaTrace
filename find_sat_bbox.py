from PIL import Image
img = Image.open("assets/image.png").convert("RGBA")
w, h = img.size

# Find bounding box where saturation (max - min of RGB) > 30 and alpha > 10
sat_left, sat_top, sat_right, sat_bottom = w, h, 0, 0
for y in range(h):
    for x in range(w):
        r, g, b, a = img.getpixel((x, y))
        if a > 10:
            diff = max(r, g, b) - min(r, g, b)
            if diff > 30:
                if x < sat_left: sat_left = x
                if x > sat_right: sat_right = x
                if y < sat_top: sat_top = y
                if y > sat_bottom: sat_bottom = y

print("Saturated BBox:", sat_left, sat_top, sat_right, sat_bottom)
