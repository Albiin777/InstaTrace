from PIL import Image

def crop_colored_gradient(img_path, output_paths):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    
    # We want to crop to the colored gradient square.
    # The gradient contains colors (pink, orange, purple).
    # The background is white (255, 255, 255) or transparent (0, 0, 0, 0).
    # So we want to find pixels that are:
    # 1. Not transparent (a > 10)
    # 2. Not white (r < 250 or g < 250 or b < 250)
    left, top, right, bottom = width, height, 0, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            if a > 10 and (r < 250 or g < 250 or b < 250):
                if x < left: left = x
                if x > right: right = x
                if y < top: top = y
                if y > bottom: bottom = y
                
    print(f"Colored gradient bounding box: left={left}, top={top}, right={right}, bottom={bottom}")
    
    if left < right and top < bottom:
        # Let's add a small 1-2px margin to ensure we don't clip the rounded corners of the gradient
        left = max(0, left - 1)
        top = max(0, top - 1)
        right = min(width - 1, right + 1)
        bottom = min(height - 1, bottom + 1)
        
        cropped = img.crop((left, top, right + 1, bottom + 1))
        
        # Make any remaining white pixels outside the rounded corners transparent
        # In a cropped gradient box of size W x H, the corners of the box (e.g. 0,0) will be white.
        # Let's make pure white pixels at the corners transparent to keep the roundness.
        c_width, c_height = cropped.size
        cropped_data = cropped.load()
        for y in range(c_height):
            for x in range(c_width):
                r, g, b, a = cropped_data[x, y]
                # If it is white/very light gray
                if r > 248 and g > 248 and b > 248:
                    # If it's near the edges (outside the rounded corner)
                    edge_limit = min(c_width, c_height) * 0.15
                    is_near_corner = (
                        (x < edge_limit and y < edge_limit) or
                        (x > c_width - edge_limit and y < edge_limit) or
                        (x < edge_limit and y > c_height - edge_limit) or
                        (x > c_width - edge_limit and y > c_height - edge_limit)
                    )
                    if is_near_corner:
                        # Make transparent
                        cropped_data[x, y] = (255, 255, 255, 0)
                        
        for out_path in output_paths:
            cropped.save(out_path, "PNG")
        print("Successfully cropped and saved the logo gradient!")
    else:
        print("Could not find the colored gradient box.")

crop_colored_gradient("public/image.png", ["public/logo.png", "public/favicon.png"])
