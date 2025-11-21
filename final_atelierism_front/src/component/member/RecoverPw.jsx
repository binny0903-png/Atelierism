import { useState, useRef, useEffect } from "react"; // React 훅 불러오기
import axios from "axios"; // HTTP 요청 라이브러리
import Swal from "sweetalert2"; // 알림 모달 라이브러리
import { Link, useNavigate } from "react-router-dom"; // 페이지 이동 및 링크

const RecoverPw = () => {
  const backServer = import.meta.env.VITE_BACK_SERVER; // 백엔드 서버 주소

  // 사용자 입력 상태
  const [memberId, setMemberId] = useState(""); // 아이디 입력
  const [idCheck, setIdCheck] = useState(0); // 0: 초기, 1: 존재, 2: 형식 오류, 3: 없음
  const [memberEmail, setMemberEmail] = useState(""); // 이메일 입력
  const [mailCode, setMailCode] = useState(null); // 서버 인증 코드
  const [inputCode, setInputCode] = useState(""); // 사용자가 입력한 인증 코드
  const [authMsg, setAuthMsg] = useState(""); // 인증 메시지
  const [authColor, setAuthColor] = useState("black"); // 인증 메시지 색상
  const [isAuthVisible, setIsAuthVisible] = useState(false); // 인증 입력창 표시 여부
  const [time, setTime] = useState(180); // 인증 타이머(초)
  const intervalRef = useRef(null); // 타이머 저장용 ref

  // 새 비밀번호 상태
  const [newPw, setNewPw] = useState(""); // 새 비밀번호
  const [newPwRe, setNewPwRe] = useState(""); // 새 비밀번호 확인
  const pwRegMsgRef = useRef(null); // 비밀번호 정규식 메시지 ref
  const pwMatchMsgRef = useRef(null); // 비밀번호 일치 메시지 ref

  const navigate = useNavigate(); // 페이지 이동 함수

  // 아이디 존재 여부 확인
  const checkId = () => {
    const idReg = /^[a-zA-Z0-9]{6,12}$/; // 아이디 정규식
    if (!idReg.test(memberId)) {
      setIdCheck(2); // 형식 오류
      return;
    }
    axios
      .get(`${backServer}/member/exists?memberId=${memberId}`) // 서버 확인
      .then((res) => {
        if (res.data === 1) setIdCheck(1); // 존재
        else setIdCheck(3); // 없음
      })
      .catch((err) => console.log(err)); // 오류 로그
  };

  // 이메일 인증코드 전송
  const sendCode = async () => {
    try {
      clearInterval(intervalRef.current); // 기존 타이머 초기화
      setTime(180); // 3분 초기화
      setIsAuthVisible(true); // 인증 입력창 표시
      setAuthMsg(""); // 메시지 초기화
      const res = await axios.get(
        `${backServer}/member/sendCode?memberEmail=${memberEmail}` // 인증코드 요청
      );
      setMailCode(res.data); // 서버에서 받은 코드 저장
    } catch (err) {
      setAuthMsg("인증코드 전송 실패"); // 실패 메시지
      setAuthColor("#F67272"); // 빨간색
    }
  };

  // 인증번호 검증
  const verifyCode = () => {
    if (inputCode === mailCode) {
      setAuthMsg("인증 완료"); // 일치하면 완료 메시지
      setAuthColor("#40C79C"); // 초록색
      clearInterval(intervalRef.current); // 타이머 종료
      setMailCode(null); // 코드 초기화
      setTime(0); // 시간 초기화
    } else {
      setAuthMsg("인증번호를 확인해주세요"); // 불일치 메시지
      setAuthColor("#F67272"); // 빨간색
    }
  };

  // 타이머 작동
  useEffect(() => {
    if (!isAuthVisible) return; // 인증창 안보이면 실행 안함

    clearInterval(intervalRef.current); // 기존 타이머 초기화
    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current); // 타이머 종료
          setMailCode(null); // 코드 초기화
          setAuthMsg("인증시간 만료"); // 메시지
          setAuthColor("red"); // 빨간색
          return 0; // 시간 0
        }
        return prev - 1; // 1초 감소
      });
    }, 1000); // 1초마다

    return () => clearInterval(intervalRef.current); // 언마운트 시 타이머 정리
  }, [isAuthVisible]);

  // 비밀번호 정규식 검사
  const checkPwReg = () => {
    pwRegMsgRef.current.classList.remove("valid", "invalid"); // 기존 클래스 제거
    const pwReg =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/; // 정규식

    if (!pwReg.test(newPw)) {
      pwRegMsgRef.current.classList.add("invalid"); // invalid 클래스 추가
      pwRegMsgRef.current.innerText =
        "비밀번호는 영문, 숫자, 특수문자를 포함한 8~16자여야 합니다."; // 메시지
    } else {
      pwRegMsgRef.current.classList.add("valid"); // valid 클래스 추가
      pwRegMsgRef.current.innerText = "사용 가능한 비밀번호입니다."; // 메시지
    }
  };

  // 비밀번호 일치 검사
  const checkPwMatch = () => {
    pwMatchMsgRef.current.classList.remove("valid", "invalid"); // 기존 클래스 제거
    if (newPw === "") return; // 비밀번호 입력 없으면 return
    if (newPw === newPwRe) {
      pwMatchMsgRef.current.classList.add("valid"); // 일치 시 valid
      pwMatchMsgRef.current.innerText = "비밀번호가 일치합니다."; // 메시지
    } else {
      pwMatchMsgRef.current.classList.add("invalid"); // 불일치 시 invalid
      pwMatchMsgRef.current.innerText = "비밀번호가 일치하지 않습니다."; // 메시지
    }
  };

  // 시간 포맷 mm:ss
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60); // 분 계산
    const sec = seconds % 60; // 초 계산
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`; // "MM:SS" 포맷
  };

  // 비밀번호 재설정 요청
  const resetPw = () => {
    // 입력 검증
    if (
      idCheck !== 1 || // 아이디 존재하지 않음
      !pwRegMsgRef.current.classList.contains("valid") || // 비밀번호 유효하지 않음
      newPw !== newPwRe // 비밀번호 불일치
    ) {
      Swal.fire("입력 오류", "입력 내용을 확인해주세요.", "warning"); // 경고
      return;
    }

    if (authMsg !== "인증 완료") {
      Swal.fire("이메일 인증", "이메일 인증을 완료해주세요.", "warning"); // 인증 안함
      return;
    }
    axios
      .patch(`${backServer}/member/resetPw`, {
        memberId, // 아이디
        memberPw: newPw, // 새 비밀번호
      })
      .then((res) => {
        if (res.data === 1) {
          Swal.fire("완료", "비밀번호가 재설정되었습니다.", "success").then(
            () => {
              navigate("/member/login"); // 로그인 페이지 이동
            }
          );
        } else {
          Swal.fire("실패", "비밀번호 재설정에 실패했습니다.", "error"); // 실패 메시지
        }
      })
      .catch(() => {
        Swal.fire("오류", "서버 오류가 발생했습니다.", "error"); // 서버 오류
      });
  };

  return (
    <section className="recover-wrap">
      <div className="page-title">비밀번호 찾기</div> {/* 페이지 타이틀 */}
      <form
        onSubmit={(e) => {
          e.preventDefault(); // 폼 기본 제출 방지
          resetPw(); // 비밀번호 재설정
        }}
      >
        {/* 아이디 입력 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberId">아이디</label>
          </div>
          <div
            className="input-item"
            style={{ flexDirection: "column", alignItems: "flex-start" }}
          >
            <input
              type="text"
              id="memberId"
              value={memberId} // 상태 바인딩
              onChange={(e) => setMemberId(e.target.value)} // 입력 시 상태 업데이트
              onBlur={checkId} // 포커스 아웃 시 아이디 확인
              placeholder="아이디를 입력해주세요"
              required
            />
            <p
              className={
                idCheck === 0
                  ? "input-msg" // 초기 상태
                  : idCheck === 1
                  ? "input-msg valid" // 존재
                  : "input-msg invalid" // 오류/없음
              }
            >
              {idCheck === 0
                ? ""
                : idCheck === 1
                ? "존재하는 아이디입니다."
                : idCheck === 2
                ? "아이디 형식을 확인해주세요."
                : "존재하지 않는 아이디입니다."}
            </p>
          </div>
        </div>

        {/* 이메일 입력 및 인증 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberEmail">이메일</label>
          </div>
          <div className="input-item">
            {!isAuthVisible && (
              <>
                <input
                  type="text"
                  id="memberEmail"
                  value={memberEmail} // 상태 바인딩
                  onChange={(e) => setMemberEmail(e.target.value)} // 입력 업데이트
                  placeholder="이메일을 입력해주세요"
                  required
                />
                <button type="button" onClick={sendCode}>
                  인증코드 전송
                </button>
              </>
            )}
            {isAuthVisible && (
              <div
                className="check-email"
                style={{ display: "flex", alignItems: "center", gap: "1px" }}
              >
                <input
                  type="text"
                  placeholder="인증번호를 입력해주세요"
                  value={inputCode} // 상태 바인딩
                  onChange={(e) => setInputCode(e.target.value)} // 입력 업데이트
                />
                {authMsg && (
                  <p style={{ color: authColor, clear: "both" }}>{authMsg}</p> // 인증 메시지
                )}
                {time > 0 && (
                  <p
                    style={{
                      color: "green",
                      marginTop: "5px",
                      marginLeft: "10px",
                    }}
                  >
                    {formatTime(time)} {/* 남은 시간 표시 */}
                  </p>
                )}
                <button type="button" onClick={verifyCode} style={{}}>
                  인증하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 새 비밀번호 입력 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="newPw">새 비밀번호</label>
          </div>
          <div
            className="input-item"
            style={{ flexDirection: "column", alignItems: "flex-start" }}
          >
            <input
              type="password"
              id="newPw"
              value={newPw} // 상태 바인딩
              onChange={(e) => setNewPw(e.target.value)} // 입력 업데이트
              onBlur={checkPwReg} // 포커스 아웃 시 정규식 체크
              placeholder="새 비밀번호를 입력해주세요"
              required
            />
            <p className="input-msg" ref={pwRegMsgRef}></p> {/* 비밀번호 정규식 메시지 */}
          </div>
        </div>

        {/* 새 비밀번호 확인 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="newPwRe">새 비밀번호 확인</label>
          </div>
          <div
            className="input-item"
            style={{ flexDirection: "column", alignItems: "flex-start" }}
          >
            <input
              type="password"
              id="newPwRe"
              value={newPwRe} // 상태 바인딩
              onChange={(e) => setNewPwRe(e.target.value)} // 입력 업데이트
              onBlur={checkPwMatch} // 포커스 아웃 시 일치 여부 체크
              placeholder="비밀번호를 다시 입력해주세요"
              required
            />
            <p className="input-msg" ref={pwMatchMsgRef}></p> {/* 비밀번호 일치 메시지 */}
          </div>
        </div>

        {/* 비밀번호 재설정 버튼 */}
        <div className="recovery-btn">
          <button type="submit">비밀번호 재설정</button>
        </div>
      </form>
    </section>
  );
};

export default RecoverPw; // 컴포넌트 export
