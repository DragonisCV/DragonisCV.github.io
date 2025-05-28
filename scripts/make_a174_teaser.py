from moviepy.editor import ImageClip, CompositeVideoClip
import numpy as np
import cv2

def create_transition_effect(before_clip, after_clip):
    """创建一个效果，初始全部是before图片，随着绿色线从左到右移动，经过的区域变为after图片"""
    
    def make_frame(t):
        # 计算线的位置（基于时间的进度从左到右移动）
        progress = t / before_clip.duration
        x_pos = int(progress * before_clip.size[0])
        
        # 获取两个图片的帧
        before_frame = before_clip.get_frame(t)
        after_frame = after_clip.get_frame(t)
        
        # 创建一个新的帧，左边是after，右边是before
        result_frame = np.copy(before_frame)
        
        # 复制after到左边部分（到线为止）
        if x_pos > 0:
            result_frame[:, :x_pos] = after_frame[:, :x_pos]
        
        # 添加绿色线
        line_thickness = 3
        color = [0, 255, 0]  # 绿色 (RGB)
        
        # 在整个高度上画线
        for y in range(result_frame.shape[0]):
            for i in range(-line_thickness//2, line_thickness//2 + 1):
                if 0 <= x_pos + i < result_frame.shape[1]:
                    result_frame[y, x_pos + i] = color
        
        return result_frame
    
    # 创建自定义视频剪辑
    new_clip = CompositeVideoClip([before_clip])
    return new_clip.fl(lambda gf, t: make_frame(t))

def resize_to_max_dim(clip, max_dim=480):
    """使用最近邻算法调整图片尺寸，使长边为指定大小"""
    width, height = clip.size
    if width >= height:
        # 宽度是长边
        new_width = max_dim
        new_height = int(height * max_dim / width)
    else:
        # 高度是长边
        new_height = max_dim
        new_width = int(width * max_dim / height)
    
    def resize_frame(frame):
        return cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_NEAREST)
    
    return clip.fl_image(resize_frame)

def brighten_clip(clip, factor=1.5):
    """提亮图片，factor=1.5表示提亮50%"""
    def brighten_frame(frame):
        # 将帧乘以factor并裁剪到0-255范围
        brightened = np.clip(frame * factor, 0, 255).astype(np.uint8)
        return brightened
    
    return clip.fl_image(brighten_frame)

def enhance_contrast(clip, factor=1.5):
    """提高图片对比度，factor=1.5表示提高50%"""
    def contrast_frame(frame):
        # 中间灰度值
        mid = 128
        
        # 应用对比度增强公式: (pixel-mid)*factor + mid
        contrasted = np.clip((frame.astype(float) - mid) * factor + mid, 0, 255).astype(np.uint8)
        return contrasted
    
    return clip.fl_image(contrast_frame)

def main():
    # 加载图片
    before_clip = ImageClip("assets/paper_teaser/dit4sr/a174_before.png").set_duration(2)  # 设置2秒的持续时间
    after_clip = ImageClip("assets/paper_teaser/dit4sr/a174_after.png").set_duration(2)
    
    # 确保两个图片尺寸相同
    if before_clip.size != after_clip.size:
        after_clip = after_clip.resize(before_clip.size)
    
    # 创建转换效果视频
    final_clip = create_transition_effect(before_clip, after_clip)
    

    output_path = "assets/paper_teaser/dit4sr/dit4sr.gif"
    final_clip.write_gif(output_path, fps=15)  # 使用较低的fps以减小GIF大小
    
    # 关闭视频文件
    before_clip.close()
    after_clip.close()
    final_clip.close()
    
    print(f"转换效果GIF已成功创建，保存在: {output_path}")

if __name__ == "__main__":
    main() 