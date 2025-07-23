import sys

# 过滤掉 PyInstaller 和系统可能添加的参数
for arg in ["-B", "-S", "-O", "-OO"]:
    while arg in sys.argv:
        sys.argv.remove(arg)

# 调试：打印实际的命令行参数
print(f"[DEBUG] sys.argv after filtering: {sys.argv}")

from iopaint import entry_point

if __name__ == "__main__":
    entry_point()
