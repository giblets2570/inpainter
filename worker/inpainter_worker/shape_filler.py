import numpy as np
from copy import deepcopy
from PIL import Image


def fill(mask: Image) -> Image:
    mask_size = mask.size
    mask = mask.resize((128, 128))

    first_ma = np.asarray(mask)[:, :, 3]

    x, y = np.where(first_ma > 0)
    coords = list(zip(x, y))

    loops = [
        (range(first_ma.shape[0]), range(first_ma.shape[1])),
        (range(first_ma.shape[0] - 1, -1, -1), range(first_ma.shape[1])),
        (range(first_ma.shape[0] - 1, -1, -1),
         range(first_ma.shape[1] - 1, -1, -1)),
        (range(first_ma.shape[0]), range(first_ma.shape[1] - 1, -1, -1)),
    ]

    mas = []
    for i_loop, j_loop in loops:
        ma = deepcopy(first_ma)
        for i in i_loop:
            in_shape = False
            in_line = False
            was_in_shape = False
            for j in j_loop:
                if (i, j) in coords:
                    in_line = True
                    ma[i][j] = 255
                    if in_shape:
                        was_in_shape = True
                        in_shape = False
                    continue
                if in_line:
                    in_line = False
                    if was_in_shape:
                        in_shape = False
                        was_in_shape = False
                    else:
                        in_shape = True
                if in_shape:
                    ma[i][j] = 255
        mas.append(ma)

    mas = np.stack(mas).sum(0)
    result = np.zeros_like(mas)
    result[mas == 1020] = 255
    return Image.fromarray(result.astype(np.uint8)).resize(mask_size)


if __name__ == '__main__':
    mask = Image.open("./mask.jpg").convert("RGBA").resize((512, 512))
    mas = fill(mask)
    print(mask)
