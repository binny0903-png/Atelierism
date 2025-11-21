import { Link, useNavigate } from "react-router-dom"; // 페이지 이동용
import "./member.css"; // 스타일 시트
import { useEffect, useRef, useState } from "react"; // React 훅
import axios from "axios"; // HTTP 요청 라이브러리
import DaumPostcode from "react-daum-postcode"; // 주소 검색 모듈
import Modal from "react-modal"; // 모달 창
import Swal from "sweetalert2"; // 팝업 알림

const MemberJoin = () => {
  // 회원가입 입력 정보 상태 관리
  const [member, setMember] = useState({
    memberId: "", // 아이디
    memberPw: "", // 비밀번호
    memberName: "", // 이름
    memberPhone: "", // 전화번호
    memberEmail: "", // 이메일
    memberAddr: "", // 주소
    memberAddrDetail: "", // 상세 주소
  });

  // 전화번호 자동 포맷 함수 (숫자만 남기고 하이픈 추가)
  const formatPhoneNumber = (value) => {
    value = value.replace(/\D/g, ""); // 숫자 이외 제거
    if (value.length < 4) return value; // 3자리 이하
    if (value.length < 8) {
      // 4~7자리
      return value.slice(0, 3) + "-" + value.slice(3);
    }
    // 8자리 이상: 010-1234-5678
    return value.slice(0, 3) + "-" + value.slice(3, 7) + "-" + value.slice(7, 11);
  };

  // 입력값 업데이트 함수
  const inputMemberData = (e) => {
    const name = e.target.name; // input name 가져오기
    let value = e.target.value; // input value 가져오기

    // 전화번호 처리
    if (name === "memberPhone") {
      value = value.replace(/\D/g, ""); // 숫자만
      value = formatPhoneNumber(value, 3, "-"); // 포맷
      if (value.endsWith("-")) value = value.slice(0, -1); // 끝 하이픈 제거
    }

    // 상태 업데이트
    const newMember = { ...member, [name]: value };
    setMember(newMember);
  };

  const backServer = import.meta.env.VITE_BACK_SERVER; // 서버 주소

  // 아이디 중복 체크 상태: 0=기본, 1=사용 가능, 2=형식 오류, 3=중복
  const [idCheck, setIdCheck] = useState(0);

  // 아이디 유효성 및 중복 체크
  const checkId = () => {
    const idReg = /^[a-zA-Z0-9]{6,12}$/; // 6~12자리 영문+숫자
    if (idReg.test(member.memberId)) {
      // 형식 통과 시 서버 호출
      axios
        .get(`${backServer}/member/exists?memberId=${member.memberId}`)
        .then((res) => {
          if (res.data === 1) setIdCheck(3); // 중복
          else setIdCheck(1); // 사용 가능
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setIdCheck(2); // 형식 오류
    }
  };

  const [memberPwRe, setMemberPwRe] = useState(""); // 비밀번호 확인
  const pwRegMsgRef = useRef(null); // 비밀번호 유효성 메시지 DOM ref

  // 비밀번호 정규식 검사
  const checkPwReg = () => {
    pwRegMsgRef.current.classList.remove("valid", "invalid"); // 이전 클래스 제거
    const pwReg =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/; // 영문+숫자+특수문자 8~16자리
    if (!pwReg.test(member.memberPw)) {
      pwRegMsgRef.current.classList.add("invalid"); // 실패
      pwRegMsgRef.current.innerText =
        "비밀번호는 영문, 숫자, 특수문자를 포함한 8~16자여야 합니다.";
    } else {
      pwRegMsgRef.current.classList.add("valid"); // 성공
      pwRegMsgRef.current.innerText = "사용 가능한 비밀번호입니다.";
    }
  };

  const pwMatchMsgRef = useRef(null); // 비밀번호 확인 메시지 DOM ref

  // 비밀번호 확인 일치 체크
  const checkPw = () => {
    pwMatchMsgRef.current.classList.remove("valid", "invalid"); // 이전 클래스 제거
    if (memberPwRe === "") return; // 비어있으면 종료
    if (member.memberPw === memberPwRe) {
      pwMatchMsgRef.current.classList.add("valid"); // 일치
      pwMatchMsgRef.current.innerText = "비밀번호가 일치합니다.";
    } else {
      pwMatchMsgRef.current.classList.add("invalid"); // 불일치
      pwMatchMsgRef.current.innerText = "비밀번호가 일치하지 않습니다.";
    }
  };

  const navigate = useNavigate(); // 페이지 이동

  // 이메일 인증 관련 상태
  const [mailCode, setMailCode] = useState(""); // 서버 발급 인증코드
  const [inputCode, setInputCode] = useState(""); // 사용자가 입력한 코드
  const [authMsg, setAuthMsg] = useState(""); // 인증 메시지
  const [authColor, setAuthColor] = useState("black"); // 메시지 색상
  const [isAuthVisible, setIsAuthVisible] = useState(false); // 인증창 보이기/숨기기
  const [time, setTime] = useState(0); // 타이머
  const intervalRef = useRef(null); // 타이머 ID

  // 이메일 인증 코드 전송
  const sendCode = async () => {
    if (member.memberEmail === "") {
      Swal.fire("이메일을 입력해주세요.");
      return;
    }
    try {
      clearInterval(intervalRef.current); // 기존 타이머 제거
      setTime(180); // 3분 초기화
      setIsAuthVisible(true); // 인증창 표시
      setAuthMsg(""); // 메시지 초기화
      setAuthColor("black"); // 메시지 색상 초기화

      const res = await axios.get(
        `${backServer}/member/sendCode?memberEmail=${member.memberEmail}`
      );
      setMailCode(res.data); // 서버에서 발급된 코드 저장

      // 타이머 시작
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setMailCode(""); // 만료 시 코드 제거
            setAuthMsg("인증시간이 만료되었습니다."); // 메시지 표시
            setAuthColor("#F67272"); // 빨간색
            return 0;
          }
          return prev - 1; // 1초씩 감소
        });
      }, 1000);
    } catch (error) {
      setAuthMsg("인증코드 전송에 실패했습니다.");
      setAuthColor("#F67272");
    }
  };

  // 인증번호 검증
  const verifyCode = () => {
    if (!mailCode) {
      setAuthMsg("인증번호가 만료되었거나 전송되지 않았습니다.");
      setAuthColor("#F67272");
      return;
    }
    if (inputCode.trim() === mailCode.toString().trim()) {
      setAuthMsg("인증완료");
      setAuthColor("#40C79C"); // 초록색
      clearInterval(intervalRef.current); // 타이머 종료
      setMailCode(""); // 코드 제거
      setTime(0); // 시간 초기화
    } else {
      setAuthMsg("인증번호가 일치하지 않습니다.");
      setAuthColor("#F67272"); // 빨간색
    }
  };

  // 남은 시간 포맷 함수
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // 회원가입 처리
  const joinMember = () => {
    // 필수 항목 모두 입력 및 유효성 검사 통과 확인
    if (
      member.memberName !== "" &&
      member.memberPhone !== "" &&
      member.memberEmail !== "" &&
      member.memberAddr !== "" &&
      member.memberAddrDetail !== "" &&
      idCheck === 1 &&
      pwRegMsgRef.current.classList.contains("valid")
    ) {
      if (authColor !== "#40C79C") {
        Swal.fire("이메일 인증을 완료해주세요");
        return;
      }

      const sendMember = { ...member, memberAddr: memberAddr.address }; // 주소 포함

      axios
        .post(`${backServer}/member`, sendMember)
        .then((res) => {
          if (res.data === 1) {
            Swal.fire({
              title: "회원가입 완료 🎉",
              text: "회원가입이 성공적으로 완료되었습니다!",
              icon: "success",
              confirmButtonText: "확인",
              confirmButtonColor: "#40C79C",
            }).then(() => {
              navigate("/"); // 홈으로 이동
            });
          }
        })
        .catch((err) => {
          console.error(err);
          Swal.fire("회원가입 중 오류가 발생했습니다.");
        });
    } else {
      Swal.fire("모든 필수 정보를 입력해주세요."); // 누락 시
    }
  };

  // 주소 모달 상태
  const [isModal, setIsModal] = useState(false); // 모달 열기/닫기
  const [memberAddr, setMemberAddr] = useState({
    zonecode: "", // 우편번호
    address: "", // 주소
  });

  // 모달 열기
  const openModal = () => setIsModal(true);
  // 모달 닫기
  const closeModal = () => setIsModal(false);

  // 주소 선택 완료 시 처리
  const onComplete = (data) => {
    setMemberAddr({ zonecode: data.zonecode, address: data.address }); // 상태 업데이트
    closeModal(); // 모달 닫기
    setMember({ ...member, memberAddr: data.address }); // member 상태에도 반영
  };

  return (
    <section className="join-wrap">
      <div className="page-title">회원가입</div>
      <form
        onSubmit={(e) => {
          e.preventDefault(); // 페이지 리로드 방지
          joinMember(); // 회원가입 함수 호출
        }}
      >
        {/* 아이디 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberId">아이디</label>
          </div>
          <div className="input-item">
            <input
              type="text"
              id="memberId"
              name="memberId"
              value={member.memberId}
              onChange={inputMemberData} // 상태 업데이트
              onBlur={checkId} // 포커스 아웃 시 아이디 체크
              placeholder="아이디를 입력해주세요"
              required
              autoComplete="off"
            />
            <p
              className={
                idCheck === 0
                  ? "input-msg"
                  : idCheck === 1
                  ? "input-msg valid"
                  : "input-msg invalid"
              }
            >
              {idCheck === 0
                ? ""
                : idCheck === 1
                ? "사용 가능한 아이디입니다."
                : idCheck === 2
                ? "아이디는 영어 대/소문자+숫자로 6~12글자 입니다."
                : "이미 사용중인 아이디입니다."}
            </p>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberPw">비밀번호</label>
          </div>
          <div className="input-item">
            <input
              type="password"
              id="memberPw"
              name="memberPw"
              value={member.memberPw}
              onChange={inputMemberData} // 상태 업데이트
              onBlur={checkPwReg} // 유효성 검사
              placeholder="비밀번호를 입력해주세요"
              required
              autoComplete="off"
            />
            <p className="input-msg" ref={pwRegMsgRef}></p> {/* 메시지 표시 */}
          </div>
        </div>

        {/* 비밀번호 확인 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberPwRe">비밀번호 확인</label>
          </div>
          <div className="input-item">
            <input
              type="password"
              id="memberPwRe"
              name="memberPwRe"
              placeholder="비밀번호를 확인해주세요"
              value={memberPwRe}
              onChange={(e) => setMemberPwRe(e.target.value)} // 상태 업데이트
              onBlur={checkPw} // 일치 여부 체크
              required
              autoComplete="off"
            />
            <p className="input-msg" ref={pwMatchMsgRef}></p>
          </div>
        </div>

        {/* 이름 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberName">이름</label>
          </div>
          <div className="input-item">
            <input
              type="text"
              id="memberName"
              name="memberName"
              value={member.memberName}
              onChange={inputMemberData} // 상태 업데이트
              placeholder="이름을 입력해주세요"
              required
              autoComplete="off"
            />
          </div>
        </div>

        {/* 전화번호 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberPhone">전화번호</label>
          </div>
          <div className="input-item">
            <input
              type="text"
              id="memberPhone"
              name="memberPhone"
              value={member.memberPhone}
              onChange={inputMemberData} // 상태 업데이트
              placeholder="전화번호를 입력해주세요"
              required
              autoComplete="off"
            />
          </div>
        </div>

        {/* 이메일 인증 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberEmail">이메일</label>
          </div>
          <div className="input-item">
            {!isAuthVisible ? (
              <>
                <input
                  type="text"
                  id="memberEmail"
                  name="memberEmail"
                  value={member.memberEmail}
                  onChange={inputMemberData}
                  placeholder="이메일을 입력해주세요"
                  required
                  autoComplete="off"
                />
                <button type="button" onClick={sendCode}>
                  인증코드 전송
                </button>
              </>
            ) : (
              <div
                className="check-email"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  placeholder="인증번호를 입력해주세요"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  autoComplete="off"
                  style={{ flex: "1" }}
                />
                {time > 0 && (
                  <span
                    style={{
                      color: "green",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatTime(time)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={verifyCode}
                  style={{
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  autoComplete="off"
                >
                  인증하기
                </button>
              </div>
            )}
            {authMsg && (
              <p style={{ color: authColor, marginTop: "5px" }}>{authMsg}</p>
            )}
          </div>
        </div>

        {/* 주소 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberAddr">주소</label>
          </div>
          <div className="input-item">
            <input
              type="text"
              id="memberAddr"
              name="memberAddr"
              value={memberAddr.address}
              onChange={inputMemberData}
              placeholder="주소를 입력해주세요"
              autoComplete="off"
            />
            <button type="button" onClick={openModal}>
              우편번호 조회
            </button>
            {isModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: "20px",
                  }}
                >
                  <DaumPostcode onComplete={onComplete} onClose={closeModal} />
                  <button onClick={closeModal} className="sb-close-modal">
                    닫기
                  </button>
                </div>
              </div>
            )}
            <input
              type="text"
              id="memberAddrDetail"
              name="memberAddrDetail"
              value={member.memberAddrDetail}
              onChange={inputMemberData}
              placeholder="상세주소를 입력해주세요"
              required
              autoComplete="off"
            />
          </div>
        </div>

        {/* 회원가입 버튼 */}
        <div className="join-button">
          <button type="submit">회원가입</button>
        </div>
      </form>
    </section>
  );
};

export default MemberJoin;
