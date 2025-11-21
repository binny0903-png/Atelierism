// React Router에서 페이지 이동과 링크를 위해 import
import { Link, useNavigate } from "react-router-dom";

// CSS import
import "./member.css";

// 다음 우편번호 검색 모듈 import
import DaumPostcode from "react-daum-postcode";

// 사이드 메뉴 컴포넌트 import
import SideMenu from "../utils/SideMenu";

// React 훅 import
import { useEffect, useRef, useState } from "react";

// Recoil 상태 관리 import
import { useRecoilState } from "recoil";
import { loginIdState, memberTypeState } from "../utils/RecoilData";

// 서버 통신용 axios import
import axios from "axios";

// 알림 모달용 Swal import
import Swal from "sweetalert2";

// MemberUpdate 컴포넌트 정의
const MemberUpdate = () => {
  // 로그인한 회원 ID 상태
  const [memberId, setMemberId] = useRecoilState(loginIdState);

  // 회원 타입 상태 (일반회원, 디자이너 등)
  const [memberType, setMemberType] = useRecoilState(memberTypeState);

  // 회원 정보 상태
  const [member, setMember] = useState(null);

  // 기존 비밀번호 상태
  const [memberPw, setMemberPw] = useState("");

  // 새 비밀번호 상태
  const [memberNewPw, setMemberNewPw] = useState("");

  // 새 비밀번호 확인 상태
  const [memberNewPwRe, setmemberNewPwRe] = useState("");

  // 기존 비밀번호 인증 여부
  const [isAuth, setIsAuth] = useState(false);

  // 사이드 메뉴 상태
  const [menus, setMenus] = useState([]);

  // 회원 타입에 따라 사이드 메뉴 세팅
  useEffect(() => {
    if (memberType === 2) {
      // 디자이너 메뉴
      setMenus([
        { url: "/designer/mypage", text: "마이페이지" },
        { url: "/member/update", text: "정보 수정" },
        { url: "/designer/designerInfo", text: "디자이너 정보" },
        { url: "/designer/status", text: "작업 현황" },
      ]);
    } else {
      // 일반 회원 메뉴
      setMenus([
        { url: "/member/mypage", text: "마이페이지" },
        { url: "/member/update", text: "정보 수정" },
        { url: "/member/payment", text: "결제 내역" },
      ]);
    }
  }, [memberType]);

  // 전화번호 형식 자동화 함수
  const formatPhoneNumber = (value) => {
    value = value.replace(/\D/g, ""); // 숫자가 아닌 문자 제거

    if (value.length < 4) return value; // 3자리 이하

    if (value.length < 8) {
      // 7자리까지는 한 개 하이픈
      return value.slice(0, 3) + "-" + value.slice(3);
    }

    // 8자리 이상: 010-1234-5678 형태
    return value.slice(0, 3) + "-" + value.slice(3, 7) + "-" + value.slice(7, 11);
  };

  // 회원 정보 입력 처리
  const inputMemberData = (e) => {
    const name = e.target.name;
    let value = e.target.value;

    if (name === "memberPhone") {
      // 전화번호는 숫자만 추출 후 포맷
      value = value.replace(/\D/g, "");
      value = formatPhoneNumber(value, 3, "-");
      if (value.endsWith("-")) value = value.slice(0, -1);
    }

    const newMember = { ...member, [name]: value };
    setMember(newMember);
  };

  // 백엔드 서버 주소
  const backServer = import.meta.env.VITE_BACK_SERVER;

  // 회원 정보 가져오기
  useEffect(() => {
    if (memberId) {
      axios.get(`${backServer}/member/${memberId}`).then((res) => {
        setMember(res.data); // 서버에서 가져온 회원 정보 상태 저장
      });
    }
  }, [memberId]);

  // 페이지 이동용 hook
  const navigate = useNavigate();

  // 회원 정보 수정
  const update = () => {
    const updatedMember = { ...member };

    // 새 비밀번호 입력 시만 memberPw 업데이트
    if (memberNewPw.trim() !== "") {
      updatedMember.memberPw = memberNewPw;
    } else {
      delete updatedMember.memberPw; // 없으면 삭제
    }

    axios
      .patch(`${backServer}/member`, updatedMember)
      .then((res) => {
        if (res.data === 1) {
          Swal.fire({ title: "정보 수정 완료", icon: "success" });
        }

        // 회원 타입에 따라 페이지 이동
        if (member.memberType === 2) navigate("/designer/mypage");
        else if (member.memberType === 3) navigate("/member/mypage");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 새 비밀번호 확인 상태
  const [memberPwRe, setMemberPwRe] = useState("");

  // 비밀번호 규칙 확인용 ref
  const pwRegMsgRef = useRef(null);

  // 비밀번호 유효성 검사
  const checkPwReg = () => {
    pwRegMsgRef.current.classList.remove("valid", "invalid");
    const pwReg =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (!pwReg.test(memberNewPw)) {
      pwRegMsgRef.current.classList.add("invalid");
      pwRegMsgRef.current.innerText = "비밀번호는 영문, 숫자, 특수문자를 포함한 8~16자여야 합니다.";
    } else {
      pwRegMsgRef.current.classList.add("valid");
      pwRegMsgRef.current.innerText = "사용 가능한 비밀번호입니다.";
    }
  };

  // 비밀번호 일치 여부 확인 ref
  const pwMatchMsgRef = useRef(null);

  // 비밀번호 일치 확인
  const checkPw = () => {
    if (!pwMatchMsgRef.current) return;

    setTimeout(() => {
      const msgEl = pwMatchMsgRef.current;
      msgEl.classList.remove("valid", "invalid");

      if (!memberNewPwRe) {
        msgEl.innerText = "";
        return;
      }

      if (memberNewPw === memberNewPwRe) {
        msgEl.classList.add("valid");
        msgEl.innerText = "비밀번호가 일치합니다.";
      } else {
        msgEl.classList.add("invalid");
        msgEl.innerText = "비밀번호가 일치하지 않습니다.";
      }
    }, 0);
  };

  // 주소 모달 상태
  const [isModal, setIsModal] = useState(false);

  // 주소 상태
  const [memberAddr, setMemberAddr] = useState({ zonecode: "", address: "" });

  const openModal = () => setIsModal(true);
  const closeModal = () => setIsModal(false);

  // 다음 주소 검색 완료 시
  const onComplete = (data) => {
    setMemberAddr({ zonecode: data.zonecode, address: data.address });
    closeModal();
    setMember({ ...member, memberAddr: data.address });
  };

  // 이메일 인증 관련 상태
  const [email, setEmail] = useState("");
  const [mailCode, setMailCode] = useState(null);
  const [inputCode, setInputCode] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [authColor, setAuthColor] = useState("black");
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const [time, setTime] = useState(180);
  const intervalRef = useRef(null);
  const emailReg = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;

  // 인증 타이머 관리
  useEffect(() => {
    if (!isAuthVisible) return;

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setMailCode(null);
          setAuthMsg("인증시간이 만료되었습니다.");
          setAuthColor("#F67272");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isAuthVisible]);

  // 이메일 인증코드 전송
  const sendCode = async () => {
    try {
      clearInterval(intervalRef.current);
      setTime(180);
      setIsAuthVisible(true);
      setAuthMsg("");
      const res = await axios.get(
        `${backServer}/member/sendCode?memberEmail=${member.memberEmail}`
      );
      setMailCode(res.data);
    } catch (error) {
      setAuthMsg("인증코드 전송에 실패했습니다.");
      setAuthColor("#F67272");
    }
  };

  // 이메일 인증 확인
  const verifyCode = () => {
    if (inputCode === mailCode) {
      setAuthMsg("인증완료");
      setAuthColor("#40C79C");
      clearInterval(intervalRef.current);
      setMailCode(null);
      setTime(0);
    } else {
      setAuthMsg("인증번호를 입력하세요");
      setAuthColor("#F67272");
    }
  };

  // 인증 남은 시간 포맷
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // 기존 비밀번호 확인
  const checkCurrentPw = async () => {
    if (!memberPw) {
      Swal.fire({ icon: "warning", title: "기존 비밀번호를 입력해주세요." });
      return;
    }

    try {
      const res = await axios.post(`${backServer}/member/checkPw`, {
        memberId: member.memberId,
        memberPw: memberPw,
      });
      if (res.data === 1) {
        Swal.fire({ icon: "success", title: "비밀번호 인증 성공" });
        setIsAuth(true);
      } else {
        Swal.fire({ icon: "error", title: "비밀번호가 일치하지 않습니다." });
        setIsAuth(false);
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "서버 오류가 발생했습니다." });
      setIsAuth(false);
    }
  };

  // 렌더링
  return (
    <div className="update-wrap">
      <div className="page-title">회원정보 수정</div>

      <section className="side-menu">
        <SideMenu menus={menus} />
      </section>

      {member !== null && (
        <form onSubmit={(e) => { e.preventDefault(); update(); }}>
          <table className="update-tbl">
            <tbody>
              {/* 아이디 */}
              <tr>
                <th>아이디</th>
                <td>
                  <input type="text" name="memberId" value={memberId} readOnly></input>
                </td>
              </tr>

              {/* 기존 비밀번호 */}
              <tr className="sb-check-pw">
                <th>기존 비밀번호</th>
                <td>
                  <input type="password" name="memberPw" value={memberPw} onChange={(e) => setMemberPw(e.target.value)}></input>
                  <button type="button" onClick={checkCurrentPw}>인증하기</button>
                </td>
              </tr>

              {/* 새 비밀번호 */}
              <tr>
                <th>새 비밀번호</th>
                <td>
                  <input type="password" name="memberNewPw" value={memberNewPw} onChange={(e) => setMemberNewPw(e.target.value)} onBlur={checkPwReg}></input>
                  <p className="input-msg" ref={pwRegMsgRef}></p>
                </td>
              </tr>

              {/* 새 비밀번호 확인 */}
              <tr>
                <th>새 비밀번호 확인</th>
                <td>
                  <input type="password" name="memberNewPwRe" value={memberNewPwRe} onChange={(e) => setmemberNewPwRe(e.target.value)} onBlur={checkPw}></input>
                  <p className="input-msg" ref={pwMatchMsgRef}></p>
                </td>
              </tr>

              {/* 전화번호 */}
              <tr>
                <th>전화번호</th>
                <td>
                  <input type="text" name="memberPhone" onChange={inputMemberData} value={member.memberPhone}></input>
                </td>
              </tr>

              {/* 이메일 인증 */}
              <tr className="sb-check-email">
                <th>이메일</th>
                {!isAuthVisible && (
                  <td>
                    <input type="text" name="memberEmail" value={member.memberEmail} onChange={inputMemberData}></input>
                    <button type="button" onClick={sendCode}>인증번호 받기</button>
                  </td>
                )}
                {isAuthVisible && (
                  <td className="check-email">
                    <input placeholder="인증번호를 입력해주세요" value={inputCode} onChange={(e) => setInputCode(e.target.value)} style={{ float: "left", fontSize: "15px", marginRight: "5px" }} />
                    {time > 0 && <p style={{ color: "green", float: "left", marginRight: "5px", textAlign: "center", marginTop: "20px" }}>{formatTime(time)}</p>}
                    <button type="button" onClick={verifyCode} style={{ marginTop: "18px", cursor: "pointer" }}>인증하기</button>
                    {authMsg && <p style={{ color: authColor, clear: "both" }}>{authMsg}</p>}
                  </td>
                )}
              </tr>

              {/* 주소 */}
              <tr>
                <th>주소</th>
                <td className="update-addr">
                  <input type="text" name="memberAddr" value={member.memberAddr} onChange={inputMemberData}></input>
                  <button type="button" onClick={openModal} style={{ cursor: "pointer" }}>우편번호 조회</button>
                  {isModal && (
                    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000 }}>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "white", padding: "20px" }}>
                        <DaumPostcode onComplete={onComplete} onClose={closeModal} />
                        <button onClick={closeModal} className="sb-close-modal">닫기</button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>

              {/* 상세 주소 */}
              <tr>
                <th>상세 주소</th>
                <td>
                  <input type="text" name="memberAddrDetail" value={member.memberAddrDetail} onChange={inputMemberData}></input>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 취소 및 수정 버튼 */}
          <div className="update-btn">
            <button type="button">
              <Link to={member.memberType === 3 ? "/member/mypage" : member.memberType === 2 ? "/designer/mypage" : ""}>취소하기</Link>
            </button>
            <button type="submit">수정하기</button>
          </div>
        </form>
      )}
    </div>
  );
};

// 컴포넌트 export
export default MemberUpdate;
