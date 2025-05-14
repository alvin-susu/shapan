from typing import Dict
import cv2
import numpy as np
import os
import serial
import time
import json

SERIAL_PORT = 'COM5' 
BAUD_RATE = 115200
SECOND_SERIAL_PORT = 'COM6'
SECOND_BAUD_RATE = 9600

def send_gcode(file_path):
    try:
        
        while True:
            
            with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
                time.sleep(2)  

                
                with open(file_path, 'r') as gcode_file:
                    for line in gcode_file:
                        line = line.strip()
                        if line and not line.startswith(';'):  
                            ser.write((line + '\n').encode('utf-8'))  
                            print(f'Sent: {line}')

                
                            while True:
                                response = ser.readline().decode('utf-8').strip()
                                if response.lower() == 'ok':
                                    print('Received: ok')
                                    break
                                elif response:
                                    print(f'Received: {response}')  

                            time.sleep(0.1)  

                print("Finished sending G-code file.")

            
            with serial.Serial(SECOND_SERIAL_PORT, SECOND_BAUD_RATE, timeout=1) as second_ser:
                time.sleep(5)  
                second_ser.write(b'1')  
                print("Sent '1' to secondary serial port.")

            
            time.sleep(1)  

    except serial.SerialException as e:
        print(f'Serial error: {e}')
    except Exception as e:
        print(f'Error: {e}')

def img_2_grbl(text: Dict):
    print("text img_paths: {}".format(text['img_path']))

    # 参数设置
    img_path = text['img_path']
    input_image = os.path.normpath(img_path)
    print("input_image: {}".format(input_image))
    output_gcode = "output.gcode"
    
    # 新增画布参数
    canvas_width_mm = 350   # 画布宽度（毫米）
    canvas_height_mm = 300  # 画布高度（毫米）
    
    draw_z = 0
    travel_z = 5
    draw_speed = 2000
    travel_speed = 5000

    # Step 1: 图像处理
    img = cv2.imread(input_image, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError(f"无法读取图片文件: {input_image}")
    height, width = img.shape
    print(f"原始尺寸：宽度 {width} 像素, 高度 {height} 像素")

    # 动态计算缩放因子（核心修改）
    scale_x = canvas_width_mm / width    # X方向每像素对应毫米数
    scale_y = canvas_height_mm / height  # Y方向每像素对应毫米数
    scale = min(scale_x, scale_y)        # 取较小值保持比例
    print(f"自动缩放因子：{scale:.4f} mm/像素")

    # 边缘检测（保持原图尺寸）
    img_bin = cv2.Canny(img, 100, 200)

    # 提取轮廓
    contours, _ = cv2.findContours(img_bin, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)

    # Step 2: 写入 G-code
    with open(output_gcode, 'w') as f:
        f.write("G21 ; 设置单位为毫米\n")
        f.write("G90 ; 使用绝对坐标\n")
        f.write(f"G1 Z{travel_z:.2f} F{travel_speed} ; 抬笔\n")

        for contour in contours:
            if len(contour) < 2:
                continue
            # 获取起点坐标（自动缩放）
            x0 = contour[0][0][0] * scale
            y0 = contour[0][0][1] * scale
            f.write(f"\nG1 X{x0:.2f} Y{y0:.2f} F{travel_speed}\n")
            f.write(f"G1 Z{draw_z:.2f} F{travel_speed} ; 落笔\n")

            # 绘制路径
            for pt in contour:
                x = pt[0][0] * scale
                y = pt[0][1] * scale
                f.write(f"G1 X{x:.2f} Y{y:.2f} F{draw_speed}\n")

            f.write(f"G1 Z{travel_z:.2f} F{travel_speed} ; 抬笔\n")

        # 结束指令
        f.write("G1 X0 Y0 F3000 ; 回原点\n")
        f.write("M2 ; 程序结束\n")

    # print(f"生成文件：{output_gcode}")
    send_gcode(output_gcode)
    # print(f"del img_path pre is {text}")

    del text["img_path"]

    # print(f"del img_path after is {text}")

    return {
        "content": text,
        "role": "assistant"
    }

if __name__ == "__main__":
    text = {
        'img_path': r'C:\Users\13509\Desktop\arduino\grbl-master\imgs\21570cfc-4ec5-4c7c-b08d-c34f6c7ce393-1.png'
    }
    img_2_grbl(text)