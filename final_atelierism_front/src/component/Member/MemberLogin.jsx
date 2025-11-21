import { Link, useNavigate } from "react-router-dom";
import "./member.css";
import { useRecoilState } from "recoil";
import { useState } from "react";
import { loginIdState, memberTypeState } from "../utils/RecoilData";
import axios from "axios";
import Swal from "sweetalert2";

const MemberLogin = () => {
  // Recoil: 로그인한 회원의 아이디와 등급을 전역 상태로 관리
  const [memberId, setMemberId] = useRecoilState(loginIdState);
  const [memberType, setMemberType] = useRecoilState(memberTypeState);

  // 로그인 입력값을 저장하는 상태
  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
  });

  // 입력창 값 변경 시 호출되는 함수
  // name 속성(memberId, memberPw)을 기준으로 해당 값 업데이트
  const inputMemberData = (e) => {
    const name = e.target.name; // 변경된 input의 name
    const value = e.target.value; // 입력된 값
    const newMember = { ...member, [name]: value }; // 기존 객체 복사 후 해당 값만 변경
    setMember(newMember); // 상태 업데이트
  };

  const navigate = useNavigate();

  // 로그인 요청 함수
  const login = () => {
    // 아이디 / 비밀번호가 비어 있는지 체크
    if (member.memberId !== "" && member.memberPw !== "") {
      const backServer = import.meta.env.VITE_BACK_SERVER; // 백엔드 서버 URL

      axios
        .post(`${backServer}/member/login`, member) // 로그인 요청
        .then((res) => {
          // 서버에서 회원 데이터가 제대로 왔는지 확인
          if (res.data && res.data.memberId) {
            // Recoil에 로그인 정보 저장
            setMemberId(res.data.memberId); 
            setMemberType(res.data.memberType);

            // 모든 axios 요청에 자동으로 Authorization 헤더 추가
            axios.defaults.headers.common["Authorization"] =
              res.data.accessToken;

            // refreshToken은 localStorage에 저장 (자동 로그인/토큰 재발급 용)
            window.localStorage.setItem(
              "refreshToken",
              res.data.refreshToken
            );

            // 로그인 성공 → 메인 페이지 이동
            navigate("/");
          }
        })
        .catch((err) => {
          console.log(err);

          // 실패 시 알림창 표시
          Swal.fire({
            title: "로그인 실패",
            text: "아이디 또는 비밀번호를 확인하세요",
            icon: "warning",
          });
        });
    } else {
      // 입력값이 비어 있는 경우
      Swal.fire({
        title: "로그인 실패",
        text: "아이디 또는 비밀번호를 입력하세요",
        icon: "warning",
      });
    }
  };

  return (
    <section className="login-wrap">
      <div className="page-title">로그인</div>

      {/* form에서 enter 입력 시 submit → login() 실행 */}
      <form
        onSubmit={(e) => {
          e.preventDefault(); // 새로고침 방지
          login(); // 로그인 실행
        }}
      >
        {/* 아이디 입력 영역 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberId">아이디</label>
          </div>
          <div className="input-item">
            <input
              type="text"
              name="memberId"
              id="memberId"
              placeholder="아이디를 입력하세요"
              value={member.memberId}
              onChange={inputMemberData}
              autoComplete="off"
            />
          </div>
        </div>

        {/* 비밀번호 입력 영역 */}
        <div className="input-wrap">
          <div className="input-title">
            <label htmlFor="memberPw">비밀번호</label>
          </div>
          <div className="input-item">
            <input
              type="password"
              name="memberPw"
              id="memberPw"
              placeholder="비밀번호를 입력하세요"
              value={member.memberPw}
              onChange={inputMemberData}
              autoComplete="off"
            />
          </div>
        </div>

        {/* 로그인 버튼 */}
        <div className="login-button">
          <button type="submit">로그인</button>
        </div>

        {/* 회원 관련 이동 링크 */}
        <div className="member-link-box">
          <Link to="/member/agree">회원가입</Link>
          <Link to="/member/recoverId">아이디 찾기</Link>
          <Link to="/member/recoverPw">비밀번호 찾기</Link>
        </div>
      </form>
    </section>
  );
};

export default MemberLogin;
