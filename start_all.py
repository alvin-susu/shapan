import subprocess
import os
import sys

# 获取当前脚本所在目录（无论exe放哪都能找到main.py）
base_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
main_py_path = os.path.join(base_dir, "main.py")

# 启动后端
backend = subprocess.Popen(
    ["python", main_py_path],
    stdout=open(os.path.join(base_dir, "backend.log"), "w"),
    stderr=subprocess.STDOUT
)

# 启动前端
frontend_path = os.path.join(base_dir, "my-app")
os.chdir(frontend_path)
subprocess.call("npm start", shell=True)