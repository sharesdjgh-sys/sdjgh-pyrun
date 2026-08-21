export interface MechdogExample {
  id: string;
  category: string;
  label: string;
  description: string;
  code: string;
}

export const MECDOG_EXAMPLES: MechdogExample[] = [
  {
    id: "intro",
    category: "📖 소개",
    label: "mechdog 소개",
    description: "mechdog는 Hiwonder의 AI 교육용 4족 보행 로봇이에요! 이동, 자세 변환, gait 설정, 기본 동작, 균형 유지, LED, 부저, 숫자 표시, 초음파/빛/버튼/IMU/카메라 센서 API를 시뮬레이션에서 한 번씩 실습할 수 있어요.",
    code: `from HW_MechDog import MechDog
import Hiwonder
import Hiwonder_IIC
import time

# 0. mechdog와 부품 준비
mechdog = MechDog()
led = Hiwonder.LED()
buzzer = Hiwonder.Buzzer()
button = Hiwonder.Button()
light = Hiwonder.LightSensor()
tm = Hiwonder.Digitaltube()
i2c1 = Hiwonder_IIC.IIC(1)
i2c2 = Hiwonder_IIC.IIC(2)
sonar = Hiwonder_IIC.I2CSonar(i2c1)
imu = Hiwonder_IIC.MPU(i2c1)
cam = Hiwonder_IIC.ESP32S3Cam(i2c2)

# 1. 기본 자세
mechdog.set_default_pose()
time.sleep(1)

# 2. 이동: 전진, 후진, 회전
mechdog.move(80, 0)
time.sleep(1.2)
mechdog.move(-50, 0)
time.sleep(1)
mechdog.move(60, 25)
time.sleep(1)
mechdog.move(60, -25)
time.sleep(1)
mechdog.move(0, 0)
time.sleep(0.5)

# 3. 걸음걸이 설정
mechdog.set_gait_params(200, 600, 50)  # 느리고 높게 걷기
mechdog.move(60, 0)
time.sleep(1.2)
mechdog.set_gait_params(100, 280, 20)  # 빠르고 낮게 걷기
mechdog.move(100, 0)
time.sleep(1.2)
mechdog.move(0, 0)

# 4. 자세 변환: 높이, 앞뒤/좌우 기울기
mechdog.transform([0, 0, 20], [0, 0, 0], 1000)
time.sleep(0.8)
mechdog.transform([0, 0, -15], [0, 0, 0], 1000)
time.sleep(0.8)
mechdog.transform([0, 0, 0], [12, 0, 0], 500)
time.sleep(0.7)
mechdog.transform([0, 0, 0], [0, 10, 0], 500)
time.sleep(0.7)
mechdog.set_default_pose()
time.sleep(0.7)

# 5. 미리 정의된 동작
actions = [
    "nodding_motion", "handshake", "scrape_a_bow",
    "boxing", "stretch_oneself", "sit_dowm",
    "stand_four_legs", "stand_two_legs", "go_prone",
    "press_up", "left_foot_kick", "right_foot_kick",
    "rotation_pitch", "rotation_roll", "pee",
]

for name in actions:
    mechdog.action_run(name)
    time.sleep(1.1)

# 6. 균형 유지
mechdog.homeostasis(True)
time.sleep(1)
mechdog.homeostasis(False)
mechdog.set_default_pose()
time.sleep(1)

# 7. 출력 장치: LED, 부저, 숫자 표시
led.on()
time.sleep(0.4)
led.set_color(0, 180, 255)
time.sleep(0.4)
led.off()

buzzer.freq(440, 300)
time.sleep(0.4)
buzzer.freq(523, 300)
time.sleep(0.4)

tm.setBrightness(4)
tm.showNum(9)
time.sleep(0.6)
tm.showStr("GO")
time.sleep(0.6)
tm.clear()

# 8. 센서 읽기 (시뮬레이션에서는 고정값을 반환해요)
distance = sonar.getDistance()
brightness = light.read()
pressed = button.Clicked()
angles = imu.read_angle()
colors = cam.color_recognition()
green = cam.color_follow(cam.GREEN)
face = cam.face_recognition()
line = cam.line_follow(cam.YELLOW)

print("거리:", distance, "cm")
print("밝기:", brightness)
print("버튼:", pressed)
print("기울기:", angles)
print("색상:", colors, "초록 추적:", green)
print("얼굴:", face, "선:", line)

# 9. 센서값으로 LED와 디스플레이 제어
tm.showNum(distance)
if distance < 15:
    sonar.setRGB(0, 255, 0, 0)
    mechdog.move(0, 0)
elif distance > 40:
    sonar.setRGB(0, 0, 80, 255)
    mechdog.move(60, 0)
else:
    sonar.setRGB(0, 255, 210, 0)
    mechdog.action_run("handshake")

time.sleep(1)
mechdog.move(0, 0)
mechdog.set_default_pose()
`,
  },
  {
    id: "forward_backward",
    category: "4.2 이동 제어",
    label: "전진 / 후진",
    description: "move(속도, 각도)로 mechdog를 걷게 해요. 속도는 -120~120 (양수=전진, 음수=후진), 각도는 -50~50 (회전 방향)이에요. time.sleep(초)으로 얼마나 이동할지 시간을 조절합니다.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.move(80, 0)   # 앞으로 (양수 → 전진)
time.sleep(3)

mechdog.move(0, 0)    # 멈추기
time.sleep(1)

mechdog.move(-50, 0)  # 뒤로 (음수 → 후진)
time.sleep(3)

mechdog.move(0, 0)
`,
  },
  {
    id: "wheel",
    category: "4.2 이동 제어",
    label: "회전 이동",
    description: "move()의 두 번째 값(각도)으로 회전을 조절해요. 양수 각도는 왼쪽, 음수 각도는 오른쪽으로 회전하며 이동합니다. 호(곡선) 모양 경로로 이동시킬 수 있어요.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.move(50, -20)  # 오른쪽으로 회전하며 이동
time.sleep(3)
mechdog.move(0, 0)
time.sleep(1)

mechdog.move(50, 20)   # 왼쪽으로 회전하며 이동
time.sleep(3)
mechdog.move(0, 0)
`,
  },
  {
    id: "body_height",
    category: "4.2 이동 제어",
    label: "높이 / 기울기",
    description: "transform([tx,ty,tz], [pitch,roll,yaw], ms)으로 몸통 높이와 기울기를 조절해요. tz는 높이(mm, 양수=올리기), pitch는 앞뒤 기울기(도), roll은 좌우 기울기(도)입니다.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.transform([0, 0, 20], [0, 0, 0], 1000)   # 몸 올리기
time.sleep(2)
mechdog.transform([0, 0, -20], [0, 0, 0], 1000)  # 몸 낮추기
time.sleep(2)
mechdog.transform([0, 0, 0], [15, 0, 0], 500)    # 앞으로 기울기
time.sleep(1.5)
mechdog.transform([0, 0, 0], [-15, 0, 0], 500)   # 뒤로 기울기
time.sleep(1.5)
mechdog.set_default_pose()
`,
  },
  {
    id: "action_run",
    category: "4.3 동작 실행",
    label: "동작 실행",
    description: "action_run(\"동작이름\")으로 미리 정의된 동작을 실행해요. mechdog는 악수, 인사, 권투, 기지개 등 총 15가지 동작을 지원합니다. time.sleep(초)으로 동작 완료를 충분히 기다려야 자연스러워요.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.action_run("handshake")       # 악수
time.sleep(3)

mechdog.action_run("nodding_motion")  # 고개 끄덕이기
time.sleep(3)

mechdog.action_run("boxing")          # 권투
time.sleep(3)
`,
  },
  {
    id: "sit_stand",
    category: "4.3 동작 실행",
    label: "앉기 / 서기",
    description: "앉기(sit_dowm), 네 발로 서기(stand_four_legs), 두 발로 서기(stand_two_legs) 동작을 순서대로 실행해요. 각 동작마다 충분한 time.sleep을 주어야 동작이 완료된 후 다음 동작으로 이어져요.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.action_run("sit_dowm")         # 앉기
time.sleep(3)

mechdog.action_run("stand_four_legs")  # 네 발로 서기
time.sleep(2)

mechdog.action_run("stand_two_legs")   # 두 발로 서기
time.sleep(3)
`,
  },
  {
    id: "homeostasis",
    category: "4.3 동작 실행",
    label: "균형 유지",
    description: "homeostasis(True)를 켜면 mechdog가 외부 충격을 받아도 자동으로 균형을 잡아요. 실제 로봇을 손으로 밀어도 스스로 자세를 교정합니다. False로 끄면 일반 자세로 돌아와요.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.homeostasis(True)   # 균형 유지 ON
time.sleep(3)

mechdog.homeostasis(False)  # 균형 유지 OFF
time.sleep(1)
`,
  },
  {
    id: "ultrasonic",
    category: "4.3 센서 활용",
    label: "초음파 거리 센서",
    description: "I2CSonar 센서로 앞 물체까지의 거리(cm)를 측정하고, 거리에 따라 LED 색상을 바꿔요. Digitaltube에 거리 수치도 표시됩니다. 시뮬레이션에서는 거리가 항상 50cm로 반환돼요.",
    code: `import Hiwonder
import Hiwonder_IIC
from HW_MechDog import MechDog
import time

mechdog = MechDog()
tm = Hiwonder.Digitaltube()
i2c1 = Hiwonder_IIC.IIC(1)
i2csonar = Hiwonder_IIC.I2CSonar(i2c1)

mechdog.set_default_pose()
time.sleep(1)

for i in range(5):
    distance = i2csonar.getDistance()
    tm.showNum(distance)           # 숫자판에 거리 표시

    if distance < 15:
        i2csonar.setRGB(0, 0xff, 0x00, 0x00)  # 빨강: 가까움
    elif distance > 40:
        i2csonar.setRGB(0, 0x00, 0x00, 0x99)  # 파랑: 멈
    else:
        i2csonar.setRGB(0, 0xfd, 0xd0, 0x00)  # 노랑: 중간

    time.sleep(0.5)
`,
  },
  {
    id: "color_tracking",
    category: "4.5 AI 비전",
    label: "색상 추적",
    description: "ESP32S3 카메라로 특정 색상을 추적해요. 물체의 X 위치에 따라 mechdog가 방향을 조정하며 이동합니다. 시뮬레이션에서는 카메라가 색상을 감지하지 않아 항상 정지 상태로 표시돼요.",
    code: `import Hiwonder_IIC
from HW_MechDog import MechDog
import time

iic2 = Hiwonder_IIC.IIC(2)
cam = Hiwonder_IIC.ESP32S3Cam(iic2)
mechdog = MechDog()

mechdog.set_default_pose()
time.sleep(2)

# 시뮬레이션: 카메라는 색상 미감지 → 정지 상태 표시
for _ in range(5):
    color = cam.color_follow(cam.GREEN)

    if color and color[0] == 3:    # 초록색 감지
        if color[1] < 60:
            mechdog.move(50, 25)   # 왼쪽으로 이동
        elif color[1] > 100:
            mechdog.move(50, -25)  # 오른쪽으로 이동
        else:
            mechdog.move(50, 0)    # 직진
    else:
        mechdog.move(0, 0)         # 색상 미감지: 정지

    time.sleep(0.3)

mechdog.move(0, 0)
`,
  },
];
