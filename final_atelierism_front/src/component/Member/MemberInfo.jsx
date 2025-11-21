// React Router에서 페이지 이동과 링크를 위해 import
import { Link, useNavigate } from "react-router-dom";

// 사이드 메뉴 컴포넌트 import
import SideMenu from "../utils/SideMenu";

// CSS import
import "./member.css";

// Recoil 상태 관리 import
import { useRecoilState, useRecoilValue } from "recoil";
import {
  authReadyState, // 인증 준비 완료 상태
  isLoginState,   // 로그인 여부 상태
  loginIdState,   // 로그인한 회원 ID 상태
  memberTypeState // 회원 타입 상태
} from "../utils/RecoilData";

// React 훅 import
import { useEffect, useState } from "react";

// 서버 통신용 axios import
import axios from "axios";

// 알림 모달용 Swal import
import Swal from "sweetalert2";

// MemberInfo 컴포넌트 정의
const MemberInfo = () => {
  // Recoil 상태에서 로그인한 회원 ID 가져오기 및 수정 함수
  const [memberId, setMemberId] = useRecoilState(loginIdState);

  // Recoil 상태에서 회원 타입 가져오기 및 수정 함수
  const [memberType, setMemberType] = useRecoilState(memberTypeState);

  // 회원 정보 상태
  const [member, setMember] = useState(null);

  // Recoil 상태로 인증 준비 여부 가져오기
  const [authReady, setAuthReady] = useRecoilState(authReadyState);

  // 회원 정보 input 처리 함수
  const inputMemberData = (e) => {
    const name = e.target.name; // 입력 필드 이름
    const value = e.target.value; // 입력값
    const newMember = { ...member, [name]: value }; // 기존 member 복사 후 값 업데이트
    setMember(newMember); // 상태 업데이트
  };

  // 백엔드 서버 주소
  const backServer = import.meta.env.VITE_BACK_SERVER;

  // 회원 정보 불러오기
  useEffect(() => {
    // 인증 준비가 안 되었으면 요청하지 않음
    if (!authReady) return;

    // 회원 정보 GET 요청
    axios
      .get(`${backServer}/member/${memberId}`)
      .then((res) => {
        setMember(res.data); // 서버에서 받아온 회원 정보 상태 업데이트
      })
      .catch((err) => {
        console.log(err); // 에러 로그
      });
  }, [authReady]); // authReady가 바뀔 때마다 실행

  // 사이드 메뉴 초기값 (일반 회원 기준)
  const [menus, setMenus] = useState([
    { url: "/member/mypage", text: "마이페이지" },
    { url: "/member/update", text: "정보 수정" },
    { url: "/member/payment", text: "결제 내역" },
  ]);

  // 페이지 이동용 hook
  const navigate = useNavigate();

  // 회원 탈퇴 함수
  const deleteMember = () => {
    // 탈퇴 확인 모달
    Swal.fire({
      title: "회원 탈퇴",
      text: "탈퇴하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "탈퇴하기",
      cancelButtonText: "취소",
      reverseButtons: true,
    }).then((res1) => {
      // 확인 시
      if (res1.isConfirmed) {
        // 서버에 DELETE 요청
        axios
          .delete(`${backServer}/member/${member.memberId}`)
          .then((res2) => {
            if (res2.data === 1) {
              // 탈퇴 성공 시 알림 후 상태 초기화
              Swal.fire({
                title: "회원 탈퇴 완료",
                text: "회원이 탈퇴되었습니다.",
                icon: "info",
              }).then(() => {
                setMemberId(""); // 로그인 ID 초기화
                setMemberType(0); // 회원 타입 초기화
                delete axios.defaults.headers.common["Authorization"]; // 인증 헤더 제거
                window.localStorage.removeItem("refreshToken"); // 토큰 제거
                navigate("/"); // 홈으로 이동
              });
            }
          })
          .catch((err) => {
            console.log(err); // 에러 로그
          });
      }
    });
  };

  return (
    <div className="mypage-wrap">
      {/* 페이지 제목 */}
      <div className="page-title">마이페이지</div>

      {/* 사이드 메뉴 */}
      <section className="side-menu mypage-side-menu">
        <SideMenu menus={menus} />
      </section>

      {/* 회원 정보가 존재할 때 */}
      {member !== null && (
        <form>
          <table className="mypage-tbl">
            <tbody>
              {/* 아이디 */}
              <tr>
                <th>아이디</th>
                <td>
                  <input
                    type="text"
                    value={member.memberId}
                    onChange={inputMemberData}
                    readOnly
                  ></input>
                </td>
              </tr>

              {/* 이름 */}
              <tr>
                <th>이름</th>
                <td>
                  <input
                    type="text"
                    value={member.memberName}
                    onChange={inputMemberData}
                    readOnly
                  ></input>
                </td>
              </tr>

              {/* 전화번호 */}
              <tr>
                <th>전화번호</th>
                <td>
                  <input
                    type="text"
                    value={member.memberPhone}
                    onChange={inputMemberData}
                    readOnly
                  ></input>
                </td>
              </tr>

              {/* 이메일 */}
              <tr>
                <th>이메일</th>
                <td>
                  <input
                    type="text"
                    value={member.memberEmail}
                    onChange={inputMemberData}
                    readOnly
                  ></input>
                </td>
              </tr>

              {/* 주소 */}
              <tr>
                <th>주소</th>
                <td>
                  <input
                    type="text"
                    value={member.memberAddr}
                    onChange={inputMemberData}
                    readOnly
                  ></input>
                </td>
              </tr>

              {/* 상세 주소 */}
              <tr>
                <th>상세 주소</th>
                <td>
                  <input
                    type="text"
                    value={member.memberAddrDetail}
                    onChange={inputMemberData}
                    readOnly
                  ></input>
                </td>
              </tr>

              {/* 회원 등급 */}
              <tr>
                <th>회원 등급</th>
                <td>
                  <input
                    type="text"
                    value={
                      member.memberType === 1
                        ? "관리자"
                        : member.memberType === 2
                        ? "디자이너"
                        : "일반회원"
                    }
                    onChange={inputMemberData}
                    readOnly
                  ></input>
                </td>
              </tr>

              {/* 회원 가입일 */}
              <tr>
                <th>회원 가입일</th>
                <td>
                  <input
                    type="text"
                    value={member.enrollDate}
                    onChange={inputMemberData}
                    readOnly
                  ></input>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 회원 탈퇴 & 디자이너 신청 */}
          <div className="secession-btn">
            <button type="button" onClick={deleteMember}>
              회원 탈퇴
            </button>
            <Link to="/designer/designerInfoFrm" className="de-designerInfoFrm">
              디자이너 신청
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

// 컴포넌트 export
export default MemberInfo;
