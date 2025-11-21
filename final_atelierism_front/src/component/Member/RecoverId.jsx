import { useState, useRef, useEffect } from "react"; // React 훅 불러오기
import { useNavigate } from "react-router-dom"; // 페이지 이동용 훅
import axios from "axios"; // HTTP 요청 라이브러리
import Modal from "react-modal"; // 모달 라이브러리
import "./member.css"; // CSS 파일 import

const RecoverId = () => {
  const backServer = import.meta.env.VITE_BACK_SERVER; // 백엔드 서버 주소 가져오기
  const navigate = useNavigate(); // 페이지 이동 함수

  // 사용자 입력 상태
  const [memberName, setMemberName] = useState(""); // 이름 입력 상태
  const [memberPhone, setMemberPhone] = useState(""); // 전화번호 입력 상태
  const [memberEmail, setMemberEmail] = useState(""); // 이메일 입력 상태

  // 전화번호 자동 하이픈 포맷 함수
  const formatPhoneNumber = (value) => {
    value = value.replace(/\D/g, ""); // 숫자만 추출
    if (value.length < 4) return value; // 3자리 이하면 그대로
    if (value.length < 8) {
      return value.slice(0, 3) + "-" + value.slice(3); // 4~7자리면 한 번만 하이픈
    }
    return (
      value.slice(0, 3) + "-" + value.slice(3, 7) + "-" + value.slice(7, 11) // 8자리 이상은 두 번 하이픈
    );
  };

  // 전화번호 입력 시 하이픈 자동 추가
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // 숫자만 추출
    value = formatPhoneNumber(value); // 포맷 적용
    if (value.endsWith("-")) value = value.slice(0, -1); // 끝에 하이픈 제거
    setMemberPhone(value); // 상태 업데이트
  };

  // 이메일 인증 관련 상태
  const [mailCode, setMailCode] = useState(null); // 서버에서 발급된 인증 코드
  const [inputCode, setInputCode] = useState(""); // 사용자가 입력한 인증 코드
  const [authMsg, setAuthMsg] = useState(""); // 인증 상태 메시지
  const [authColor, setAuthColor] = useState("black"); // 메시지 색상
  const [isAuthVisible, setIsAuthVisible] = useState(false); // 인증 입력창 표시 여부
  const [time, setTime] = useState(180); // 인증 코드 제한 시간(초)
  const intervalRef = useRef(null); // 타이머 interval 저장용

  // Modal 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // 결과 모달 열림 여부
  const [foundId, setFoundId] = useState(""); // 찾은 아이디 저장

  // react-modal 접근성 설정
  Modal.setAppElement("#root"); // 앱 루트 엘리먼트 설정

  // 인증 타이머 관리
  useEffect(() => {
    if (!isAuthVisible) return; // 인증창 안보이면 실행 안함
    clearInterval(intervalRef.current); // 기존 타이머 초기화

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current); // 타이머 종료
          setMailCode(null); // 인증 코드 초기화
          setAuthMsg("인증시간이 만료되었습니다."); // 메시지 업데이트
          setAuthColor("#F67272"); // 메시지 빨간색
          return 0; // 시간 0으로
        }
        return prev - 1; // 1초 감소
      });
    }, 1000); // 1초 간격

    return () => clearInterval(intervalRef.current); // 컴포넌트 언마운트 시 타이머 정리
  }, [isAuthVisible]); // 인증창 표시 여부에 따라 재실행

  // 인증코드 전송
  const sendCode = async () => {
    if (!memberEmail) {
      setAuthMsg("이메일을 입력해주세요."); // 이메일 없으면 메시지
      setAuthColor("#F67272"); // 빨간색
      return;
    }

    try {
      clearInterval(intervalRef.current); // 기존 타이머 초기화
      setTime(180); // 3분 초기화
      setIsAuthVisible(true); // 인증창 표시
      setAuthMsg(""); // 메시지 초기화
      const res = await axios.get(
        `${backServer}/member/sendCode?memberEmail=${memberEmail}` // 백엔드로 인증코드 요청
      );
      setMailCode(res.data); // 서버에서 받은 코드 저장
      setAuthMsg("인증코드가 전송되었습니다."); // 메시지 표시
      setAuthColor("green"); // 초록색
    } catch (err) {
      setAuthMsg("인증코드 전송 실패"); // 실패 시 메시지
      setAuthColor("#F67272"); // 빨간색
    }
  };

  // 인증번호 확인
  const verifyCode = () => {
    if (inputCode === mailCode) {
      setAuthMsg("인증 완료"); // 일치하면 완료 메시지
      setAuthColor("#40C79C"); // 초록색
      clearInterval(intervalRef.current); // 타이머 종료
      setMailCode(null); // 코드 초기화
      setTime(0); // 시간 초기화
    } else {
      setAuthMsg("인증번호가 일치하지 않습니다."); // 틀리면 메시지
      setAuthColor("#F67272"); // 빨간색
    }
  };

  // 시간 포맷 (mm:ss)
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60); // 분
    const sec = seconds % 60; // 초
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`; // "MM:SS" 형태
  };

  // 아이디 찾기 요청
  const findId = async (e) => {
    e.preventDefault(); // 폼 제출 기본 동작 막기

    if (!memberName || !memberPhone || !memberEmail) {
      alert("모든 정보를 입력해주세요."); // 입력 누락 체크
      return;
    }

    if (authMsg !== "인증 완료") {
      alert("이메일 인증을 완료해주세요."); // 인증 안했으면 안내
      return;
    }

    try {
      const res = await axios.post(`${backServer}/member/findId`, {
        memberName, // 이름
        memberPhone, // 전화번호
        memberEmail, // 이메일
      });

      if (res.data) {
        setFoundId(res.data); // 찾은 아이디 저장
        setIsModalOpen(true); // 모달 열기
      } else {
        alert("입력하신 정보와 일치하는 계정이 없습니다."); // 없으면 안내
      }
    } catch (err) {
      alert("요청 처리 중 오류가 발생했습니다."); // 서버 오류 안내
    }
  };

  return (
    <section className="recover-id-wrap">
      <div className="page-title">아이디 찾기</div> {/* 페이지 타이틀 */}
      <form onSubmit={findId}>
        {/* 이름 입력 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberName">이름</label>
          </div>
          <div className="input-item">
            <input
              type="text"
              id="memberName"
              value={memberName} // 상태 바인딩
              onChange={(e) => setMemberName(e.target.value)} // 입력 시 상태 업데이트
              placeholder="이름을 입력해주세요"
              required
              style={{ width: "400px" }}
            />
          </div>
        </div>

        {/* 전화번호 입력 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberPhone">전화번호</label>
          </div>
          <div className="input-item">
            <input
              type="text"
              id="memberPhone"
              value={memberPhone} // 상태 바인딩
              onChange={handlePhoneChange} // 전화번호 포맷 적용
              placeholder="전화번호를 입력해주세요"
              required
              maxLength={13} // 최대 13자리 (010-1234-5678)
              style={{ width: "400px" }}
            />
          </div>
        </div>

        {/* 이메일 입력 및 인증 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberEmail" style={{ maxWidth: "92px" }}>
              이메일
            </label>
          </div>
          <div className="input-item">
            {!isAuthVisible ? (
              // 인증코드 받기 전 UI
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input
                  type="text"
                  id="memberEmail"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="이메일을 입력해주세요"
                  required
                  style={{
                    width: "290px",
                    border: "none",
                    borderBottom: "1px solid #9a9a9a",
                    fontSize: "18px",
                  }}
                />
                <button
                  type="button"
                  onClick={sendCode} // 인증코드 전송
                  style={{
                    border: "1px solid #8aa996",
                    backgroundColor: "#8aa996",
                    padding: "5px 15px",
                    borderRadius: "8px",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  인증코드 전송
                </button>
              </div>
            ) : (
              // 인증코드 입력 UI
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  maxWidth: "400px",
                  alignItems: "flex-end",
                }}
              >
                <input
                  type="text"
                  placeholder="인증번호를 입력해주세요"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)} // 입력 상태 업데이트
                  style={{
                    width: "310px",
                    border: "none",
                    borderBottom: "1px solid #9a9a9a",
                  }}
                />
                {time > 0 && (
                  <span style={{ color: "green", minWidth: "50px" }}>
                    {formatTime(time)} {/* 남은 시간 표시 */}
                  </span>
                )}
                <button
                  type="button"
                  onClick={verifyCode} // 인증 확인
                  style={{
                    border: "1px solid #8aa996",
                    backgroundColor: "#8aa996",
                    padding: "5px 15px",
                    borderRadius: "8px",
                    color: "#fff",
                    width: "100px",
                    cursor: "pointer",
                  }}
                >
                  인증하기
                </button>
              </div>
            )}
            {authMsg && <p style={{ color: authColor }}>{authMsg}</p>} {/* 인증 메시지 */}
          </div>
        </div>

        {/* 아이디 찾기 버튼 */}
        <div className="sb-recover-id-btn">
          <button type="submit" style={{ cursor: "pointer" }}>
            아이디 찾기
          </button>
        </div>
      </form>

      {/* 결과 모달 */}
      <Modal
        isOpen={isModalOpen} // 모달 열림 여부
        onRequestClose={() => setIsModalOpen(false)} // 모달 닫기
        style={{
          content: {
            width: "400px",
            height: "220px",
            margin: "auto",
            borderRadius: "10px",
            textAlign: "center",
            paddingTop: "40px",
          },
          overlay: {
            backgroundColor: "rgba(0,0,0,0.5)", // 배경 반투명
          },
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>아이디 찾기 결과</h2>
        <p style={{ fontSize: "18px" }}>
          회원님의 아이디는 <b style={{ color: "#40C79C" }}>{foundId}</b>{" "}
          입니다.
        </p>
        <button
          style={{
            marginTop: "50px",
            padding: "10px 20px",
            border: "none",
            backgroundColor: "#8aa996",
            color: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => {
            setIsModalOpen(false); // 모달 닫기
            navigate("/member/login"); // 로그인 페이지 이동
          }}
        >
          로그인하러 가기
        </button>
      </Modal>
    </section>
  );
};

export default RecoverId; // 컴포넌트 export
