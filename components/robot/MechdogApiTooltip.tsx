"use client";

import React, { useState } from "react";

type Tab = "move" | "action" | "sensor" | "vision" | "output";

const ACCENT = "#C97B30";
const ACCENT_LIGHT = "#FFF4E6";
const ACCENT_MID = "#F0A050";
const TEXT = "#5A3E1B";
const MUTED = "#A88060";
const CODE = "#C97B30";

const tabList: { id: Tab; label: string; emoji: string }[] = [
  { id: "move",   label: "이동 제어",  emoji: "🦾" },
  { id: "action", label: "동작 실행",  emoji: "🐾" },
  { id: "sensor", label: "센서",       emoji: "📡" },
  { id: "vision", label: "AI 비전",    emoji: "👁️" },
  { id: "output", label: "출력 장치",  emoji: "💡" },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <code
      style={{
        display: "block",
        background: "#FFF8F0",
        border: "1px solid #F5DEB8",
        borderRadius: 7,
        padding: "6px 10px",
        fontSize: 11.5,
        color: CODE,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        whiteSpace: "pre",
        lineHeight: 1.6,
        marginTop: 4,
      }}
    >
      {children}
    </code>
  );
}

function Entry({
  sig,
  desc,
  example,
}: {
  sig: string;
  desc: string;
  example: string;
}) {
  return (
    <div
      style={{
        background: ACCENT_LIGHT,
        borderRadius: 10,
        padding: "9px 11px",
        borderLeft: `3px solid ${ACCENT_MID}`,
      }}
    >
      <code style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{sig}</code>
      <p style={{ margin: "3px 0 0", fontSize: 11.5, color: TEXT, lineHeight: 1.5 }}>{desc}</p>
      <CodeBlock>{example}</CodeBlock>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: MUTED,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {children}
      </div>
    </div>
  );
}

export default function MechdogApiTooltip() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("move");

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: `1.5px solid #F5DEB8`,
          background: isOpen ? ACCENT_LIGHT : "#fff",
          color: ACCENT,
          fontFamily: "inherit",
          fontSize: 12.5,
          fontWeight: 700,
          padding: "5px 12px",
          borderRadius: 10,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.15s ease",
        }}
      >
        <span>🐾 mecdog API</span>
        <span
          style={{
            fontSize: 10,
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            display: "inline-block",
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 100,
            width: 480,
            background: "#fff",
            border: "1px solid #F5DEB8",
            borderRadius: 16,
            padding: "14px 16px 16px",
            boxShadow: "0 10px 30px rgba(201,123,48,.13)",
            animation: "popIn 0.2s ease",
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#3A2810",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>🐾 mecdog 함수 사전</span>
            <span
              style={{
                fontSize: 11,
                color: ACCENT,
                background: ACCENT_LIGHT,
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              from HW_MechDog import MechDog 필수!
            </span>
          </div>

          {/* 탭 */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {tabList.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: "5px 4px",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  fontWeight: 700,
                  background: tab === t.id ? `linear-gradient(135deg,${ACCENT_MID},${ACCENT})` : ACCENT_LIGHT,
                  color: tab === t.id ? "#fff" : MUTED,
                  transition: "all .13s",
                }}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* 탭 내용 */}
          <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>

            {/* ── 이동 제어 ── */}
            {tab === "move" && (
              <>
                <Section title="기본 설정">
                  <Entry
                    sig="mechdog = MechDog()"
                    desc="mecdog 객체를 만들어요. 모든 명령은 이 객체를 통해 보냅니다."
                    example={`from HW_MechDog import MechDog\nmechdog = MechDog()`}
                  />
                  <Entry
                    sig="mechdog.set_default_pose()"
                    desc="로봇을 기본 자세(네 발로 바로 서기)로 만들어요. 다른 동작 전에 먼저 호출하는 게 좋아요."
                    example={`mechdog.set_default_pose()\ntime.sleep(1)`}
                  />
                </Section>

                <Section title="이동 명령">
                  <Entry
                    sig="mechdog.move(speed, angle)"
                    desc="speed: 속도 (-120~120, 양수=전진 음수=후진) / angle: 방향 (-50~50, 양수=좌회전 음수=우회전). time.sleep(초)로 이동 시간을 조절해요."
                    example={`mechdog.move(80, 0)    # 전진\ntime.sleep(3)\nmechdog.move(-50, 0)  # 후진\ntime.sleep(3)\nmechdog.move(0, 0)    # 정지`}
                  />
                  <Entry
                    sig="mechdog.move(speed, angle)  ← 회전"
                    desc="angle 값으로 회전 방향을 조절해요. 양수=왼쪽 방향, 음수=오른쪽 방향."
                    example={`mechdog.move(60, 25)   # 왼쪽 방향으로 전진\ntime.sleep(3)\nmechdog.move(60, -25)  # 오른쪽 방향으로 전진\ntime.sleep(3)`}
                  />
                </Section>

                <Section title="자세 변환">
                  <Entry
                    sig="mechdog.transform([tx,ty,tz], [pitch,roll,yaw], ms)"
                    desc="tz: 높이 조절(mm) / pitch: 앞뒤 기울기(도) / roll: 좌우 기울기(도) / ms: 동작 시간(밀리초)"
                    example={`mechdog.transform([0,0,20], [0,0,0], 1000)  # 몸 올리기\ntime.sleep(2)\nmechdog.transform([0,0,0], [15,0,0], 500)  # 앞으로 기울기\ntime.sleep(1.5)\nmechdog.set_default_pose()`}
                  />
                </Section>

                <Section title="걸음걸이 조절">
                  <Entry
                    sig="mechdog.set_gait_params(lift_time, land_time, height)"
                    desc="발을 드는 시간(ms), 내딛는 시간(ms), 발 높이(mm)를 조절해요. 값이 클수록 천천히 높게 걸어요."
                    example={`# 느리고 높게 걷기\nmechdog.set_gait_params(200, 600, 50)\nmechdog.move(60, 0)\ntime.sleep(3)\n\n# 빠르고 낮게 걷기\nmechdog.set_gait_params(100, 280, 20)\nmechdog.move(120, 0)\ntime.sleep(3)`}
                  />
                </Section>

                <Section title="균형 유지">
                  <Entry
                    sig="mechdog.homeostasis(True / False)"
                    desc="자동 균형 유지 기능을 켜거나 꺼요. True이면 외부 힘에 반응해 자세를 유지합니다."
                    example={`mechdog.homeostasis(True)   # 균형 유지 ON\ntime.sleep(5)\nmechdog.homeostasis(False)  # 균형 유지 OFF`}
                  />
                </Section>
              </>
            )}

            {/* ── 동작 실행 ── */}
            {tab === "action" && (
              <>
                <Section title="동작 실행 방법">
                  <Entry
                    sig='mechdog.action_run("동작이름")'
                    desc="미리 정의된 동작을 실행해요. time.sleep(초)로 동작 완료를 기다려요."
                    example={`mechdog.set_default_pose()\ntime.sleep(1)\n\nmechdog.action_run("handshake")  # 악수\ntime.sleep(3)`}
                  />
                </Section>

                <Section title="이동 동작">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                      ["left_foot_kick",  "🦵 왼발 차기"],
                      ["right_foot_kick", "🦵 오른발 차기"],
                      ["stand_four_legs", "🐕 네 발로 서기"],
                      ["sit_dowm",        "🐾 앉기"],
                      ["go_prone",        "😴 엎드리기"],
                      ["stand_two_legs",  "🐩 두 발로 서기"],
                    ].map(([name, label]) => (
                      <div
                        key={name}
                        style={{
                          background: ACCENT_LIGHT,
                          borderRadius: 8,
                          padding: "7px 10px",
                          borderLeft: `3px solid ${ACCENT_MID}`,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{label}</div>
                        <code style={{ fontSize: 10.5, color: ACCENT }}>"{name}"</code>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="퍼포먼스 동작">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                      ["handshake",      "🤝 악수"],
                      ["scrape_a_bow",   "🙇 인사"],
                      ["nodding_motion", "😊 고개 끄덕이기"],
                      ["boxing",         "🥊 권투"],
                      ["stretch_oneself","😸 기지개"],
                      ["pee",            "💧 쉬~ 포즈"],
                      ["press_up",       "💪 팔굽혀펴기"],
                      ["rotation_pitch", "↕ 앞뒤 흔들기"],
                      ["rotation_roll",  "↔ 좌우 흔들기"],
                    ].map(([name, label]) => (
                      <div
                        key={name}
                        style={{
                          background: ACCENT_LIGHT,
                          borderRadius: 8,
                          padding: "7px 10px",
                          borderLeft: `3px solid ${ACCENT_MID}`,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{label}</div>
                        <code style={{ fontSize: 10.5, color: ACCENT }}>"{name}"</code>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="여러 동작 연속 실행 예제">
                  <Entry
                    sig="동작 연속 실행"
                    desc="action_run을 여러 번 써서 공연처럼 연속 동작을 만들 수 있어요."
                    example={`mechdog.set_default_pose()\ntime.sleep(1)\n\nmechdog.action_run("scrape_a_bow")  # 인사\ntime.sleep(3)\nmechdog.action_run("boxing")        # 권투\ntime.sleep(3)\nmechdog.action_run("handshake")     # 악수\ntime.sleep(3)`}
                  />
                </Section>
              </>
            )}

            {/* ── 센서 ── */}
            {tab === "sensor" && (
              <>
                <div
                  style={{
                    background: "#FFF8F0",
                    border: "1px dashed #F5DEB8",
                    borderRadius: 8,
                    padding: "7px 10px",
                    marginBottom: 10,
                    fontSize: 11.5,
                    color: MUTED,
                  }}
                >
                  💡 시뮬레이션에서는 센서가 고정값을 반환해요: 거리 50cm, 밝기 500
                </div>

                <Section title="초음파 거리 센서 (I2CSonar)">
                  <Entry
                    sig="i2csonar.getDistance()"
                    desc="앞 물체까지의 거리(cm)를 반환해요. 시뮬레이션에서는 항상 50을 반환합니다."
                    example={`import Hiwonder_IIC\ni2c1 = Hiwonder_IIC.IIC(1)\ni2csonar = Hiwonder_IIC.I2CSonar(i2c1)\n\ndistance = i2csonar.getDistance()\nprint("거리:", distance, "cm")`}
                  />
                  <Entry
                    sig="i2csonar.setRGB(index, r, g, b)"
                    desc="센서의 RGB LED 색상을 설정해요. r/g/b 값은 0~255입니다."
                    example={`# 거리에 따른 LED 색상 변경\nif distance < 15:\n    i2csonar.setRGB(0, 0xff, 0x00, 0x00)  # 빨강\nelif distance > 40:\n    i2csonar.setRGB(0, 0x00, 0x00, 0x99)  # 파랑\nelse:\n    i2csonar.setRGB(0, 0xfd, 0xd0, 0x00)  # 노랑`}
                  />
                </Section>

                <Section title="조도 센서 (LightSensor)">
                  <Entry
                    sig="sensor.read()"
                    desc="주변 밝기 값을 읽어요 (0~4095, 작을수록 어두움). 시뮬레이션에서는 500을 반환합니다."
                    example={`import Hiwonder\nsensor = Hiwonder.LightSensor()\n\nbright = sensor.read()\nif bright < 200:\n    print("어두워요!")\nelse:\n    print("밝아요!")`}
                  />
                </Section>

                <Section title="버튼 (Button)">
                  <Entry
                    sig="btn.Clicked() / btn.isPressed()"
                    desc="물리 버튼의 클릭/눌림 상태를 반환해요. 시뮬레이션에서는 항상 False를 반환합니다."
                    example={`import Hiwonder\nbtn = Hiwonder.Button()\n\nif btn.Clicked():\n    mechdog.action_run("handshake")`}
                  />
                </Section>

                <Section title="자세 센서 (IMU/MPU)">
                  <Entry
                    sig="imu.read_angle()"
                    desc="[pitch, roll, yaw] 형태의 기울기 각도 리스트를 반환해요. 시뮬레이션에서는 [0.0, 0.0, 0.0]을 반환합니다."
                    example={`import Hiwonder_IIC\ni2c1 = Hiwonder_IIC.IIC(1)\nimu = Hiwonder_IIC.MPU(i2c1)\n\nangles = imu.read_angle()\nprint("Pitch:", angles[0])\nprint("Roll: ", angles[1])`}
                  />
                </Section>
              </>
            )}

            {/* ── AI 비전 ── */}
            {tab === "vision" && (
              <>
                <div
                  style={{
                    background: "#FFF8F0",
                    border: "1px dashed #F5DEB8",
                    borderRadius: 8,
                    padding: "7px 10px",
                    marginBottom: 10,
                    fontSize: 11.5,
                    color: MUTED,
                  }}
                >
                  💡 시뮬레이션에서는 카메라가 연결되지 않아 색상·얼굴·선을 감지하지 않습니다 (None/False 반환)
                </div>

                <Section title="카메라 생성">
                  <Entry
                    sig="cam = Hiwonder_IIC.ESP32S3Cam(iic2)"
                    desc="ESP32S3 카메라 객체를 만들어요. I2C 2번 포트를 사용합니다."
                    example={`import Hiwonder_IIC\niic2 = Hiwonder_IIC.IIC(2)\ncam = Hiwonder_IIC.ESP32S3Cam(iic2)`}
                  />
                </Section>

                <Section title="색상 인식">
                  <Entry
                    sig="cam.color_recognition()"
                    desc="화면에서 감지된 색상 목록을 반환해요. 빈 리스트면 색상이 없는 것."
                    example={`colors = cam.color_recognition()\nif cam.RED in colors:\n    print("빨간색 발견!")\nif cam.GREEN in colors:\n    print("초록색 발견!")`}
                  />
                  <Entry
                    sig="cam.color_follow(색상상수)"
                    desc="특정 색상을 추적해요. 반환값: [색ID, 중심X, 중심Y, x1, y1, x2, y2] 또는 None"
                    example={`color = cam.color_follow(cam.GREEN)\n\nif color and color[0] == cam.GREEN:\n    cx = color[1]  # 중심 X 위치\n    if cx < 60:\n        mechdog.move(50, 25)   # 왼쪽으로\n    elif cx > 100:\n        mechdog.move(50, -25)  # 오른쪽으로\n    else:\n        mechdog.move(50, 0)    # 직진\nelse:\n    mechdog.move(0, 0)         # 정지`}
                  />
                </Section>

                <Section title="얼굴 인식">
                  <Entry
                    sig="cam.face_recognition()"
                    desc="얼굴을 감지하면 True, 아니면 False를 반환해요."
                    example={`is_face = cam.face_recognition()\n\nif is_face:\n    mechdog.action_run("handshake")  # 악수\n    time.sleep(3)\nelse:\n    mechdog.move(0, 0)`}
                  />
                </Section>

                <Section title="선 추적">
                  <Entry
                    sig="cam.line_follow(색상상수)"
                    desc="노란선 등을 따라가요. 반환값: (중심X, 중심Y) 튜플."
                    example={`center = cam.line_follow(cam.YELLOW)\ncx, cy = center\n\n# 선 위치에 따라 방향 조절\nif cx < 60:\n    mechdog.move(50, 20)   # 왼쪽 조향\nelif cx > 100:\n    mechdog.move(50, -20)  # 오른쪽 조향\nelse:\n    mechdog.move(60, 0)    # 직진`}
                  />
                </Section>

                <Section title="색상 상수">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                      ["cam.RED",    "🔴 빨강 (1)"],
                      ["cam.YELLOW", "🟡 노랑 (2)"],
                      ["cam.GREEN",  "🟢 초록 (3)"],
                      ["cam.BLUE",   "🔵 파랑 (4)"],
                    ].map(([name, label]) => (
                      <div
                        key={name}
                        style={{
                          background: ACCENT_LIGHT,
                          borderRadius: 8,
                          padding: "7px 10px",
                          borderLeft: `3px solid ${ACCENT_MID}`,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{label}</div>
                        <code style={{ fontSize: 10.5, color: ACCENT }}>{name}</code>
                      </div>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {/* ── 출력 장치 ── */}
            {tab === "output" && (
              <>
                <Section title="LED">
                  <Entry
                    sig="led.on() / led.off()"
                    desc="LED를 켜거나 꺼요."
                    example={`import Hiwonder\nled = Hiwonder.LED()\n\nled.on()          # LED 켜기\ntime.sleep(1)\nled.off()         # LED 끄기`}
                  />
                  <Entry
                    sig="led.set_color(r, g, b)"
                    desc="LED를 원하는 색으로 켜요. 각 값은 0~255."
                    example={`led.set_color(255, 0, 0)    # 빨강\ntime.sleep(1)\nled.set_color(0, 255, 0)    # 초록\ntime.sleep(1)\nled.set_color(0, 0, 255)    # 파랑\ntime.sleep(1)\nled.set_color(0, 0, 0)      # 끄기`}
                  />
                </Section>

                <Section title="부저 (Buzzer)">
                  <Entry
                    sig="buzzer.freq(주파수, 지속시간)"
                    desc="지정한 주파수(Hz)로 소리를 내요. 시뮬레이션에서는 부저음 표시로 대체됩니다."
                    example={`import Hiwonder\nbuzzer = Hiwonder.Buzzer()\n\nbuzzer.freq(440, 500)  # 라(A4) 음, 0.5초\ntime.sleep(0.6)\nbuzzer.freq(523, 500)  # 도(C5) 음, 0.5초\ntime.sleep(0.6)`}
                  />
                </Section>

                <Section title="숫자 디스플레이 (Digitaltube)">
                  <Entry
                    sig="tm.showNum(숫자) / tm.showStr(문자열)"
                    desc="7-세그먼트 디지털 디스플레이에 숫자나 문자를 표시해요. 시뮬레이션에서는 말풍선으로 표시됩니다."
                    example={`import Hiwonder\ntm = Hiwonder.Digitaltube()\ntm.setBrightness(4)  # 밝기 설정 (0~7)\n\nfor i in range(10):\n    tm.showNum(i)     # 0~9 순서로 표시\n    time.sleep(0.5)`}
                  />
                </Section>

                <Section title="초음파 센서 RGB LED와 디스플레이 연동 예제">
                  <Entry
                    sig="거리 측정 + 표시 종합 예제"
                    desc="센서 값을 읽어 LED 색상과 디스플레이를 동시에 제어하는 패턴이에요."
                    example={`import Hiwonder, Hiwonder_IIC\nfrom HW_MechDog import MechDog\nimport time\n\nmechdog = MechDog()\ntm = Hiwonder.Digitaltube()\ni2c1 = Hiwonder_IIC.IIC(1)\nsonar = Hiwonder_IIC.I2CSonar(i2c1)\n\nmechdog.set_default_pose()\ntime.sleep(1)\n\nfor _ in range(8):\n    dist = sonar.getDistance()\n    tm.showNum(dist)\n    if dist < 15:\n        sonar.setRGB(0, 255, 0, 0)  # 빨강\n        mechdog.move(0, 0)           # 정지\n    else:\n        sonar.setRGB(0, 0, 200, 100) # 초록\n        mechdog.move(80, 0)          # 전진\n    time.sleep(0.5)`}
                  />
                </Section>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
