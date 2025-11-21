import { useEffect, useState } from "react"; // React 훅 불러오기: 상태 관리(useState), 라이프사이클 관리(useEffect)
import "./member.css"; // 멤버 관련 CSS 임포트
import SideMenu from "../utils/SideMenu"; // 사이드 메뉴 컴포넌트 임포트
import { useRecoilValue } from "recoil"; // Recoil 상태 읽기용 훅
import { loginIdState } from "../utils/RecoilData"; // 로그인한 사용자 ID 상태
import axios from "axios"; // HTTP 요청을 위한 axios
import { Link } from "react-router-dom"; // 라우팅 링크 컴포넌트

const Payment = () => {
  const memberId = useRecoilValue(loginIdState); // 로그인한 회원 ID 읽기
  const [payments, setPayments] = useState([]); // 결제 내역 상태
  const [visibleCount, setVisibleCount] = useState(6); // 한 번에 보여줄 결제 카드 수
  const [sortOrder, setSortOrder] = useState("desc"); // 정렬 순서 상태: 최신순 기본

  // 사이드 메뉴 항목 정의
  const menus = [
    { url: "/member/mypage", text: "마이페이지" },
    { url: "/member/update", text: "정보 수정" },
    { url: "/member/payment", text: "결제 내역" },
  ];

  // 결제 내역 불러오기
  useEffect(() => {
    if (!memberId) return; // 회원 ID가 없으면 요청하지 않음

    axios
      .get(`${import.meta.env.VITE_BACK_SERVER}/member/payments/${memberId}`) // 백엔드에서 회원 결제 내역 조회
      .then((res) => {
        // 받은 데이터를 프론트에서 정렬
        const sorted = [...res.data].sort((a, b) => {
          const dateA = new Date(a.interiorPaymentDate); // 결제일 변환
          const dateB = new Date(b.interiorPaymentDate);
          return sortOrder === "desc" ? dateB - dateA : dateA - dateB; // 최신순 or 오래된순
        });
        setPayments(sorted); // 정렬된 결제 내역 상태에 저장
      })
      .catch((err) => console.error(err)); // 에러 로그
  }, [memberId, sortOrder]); // memberId나 sortOrder가 바뀌면 다시 실행

  // 화면에 보여줄 결제 내역만 잘라서 가져오기
  const visiblePayments = payments.slice(0, visibleCount);

  // 더보기 버튼 클릭 시 보여줄 카드 수 증가
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  // UI 렌더링
  return (
    <section className="payment-wrap">
      {/* 페이지 타이틀 */}
      <div className="page-title" style={{ fontSize: "22px" }}>
        결제 내역
      </div>

      <div className="payment-content-wrap">
        {/* 사이드 메뉴 */}
        <section className="side-menu">
          <SideMenu menus={menus} />
        </section>

        {/* 메인 콘텐츠 영역 */}
        <div className="sb-main-content">
          {/* 정렬 선택 UI */}
          <div className="room-select" style={{ marginLeft: "10px" }}>
            <label style={{ fontSize: "18px", fontWeight: "bold" }}>
              정렬 기준:{" "}
            </label>
            <select
              value={sortOrder} // 선택된 값 반영
              onChange={(e) => {
                setSortOrder(e.target.value); // sortOrder 상태 변경
                setVisibleCount(6); // 정렬 변경 시 처음 6개만 보여주기
              }}
            >
              <option value="desc">최신순</option>
              <option value="asc">오래된 순</option>
            </select>
          </div>

          {payments.length > 0 ? ( // 결제 내역이 있는 경우
            <>
              <div className="payment-list">
                {visiblePayments.map((item) => {
                  // 인테리어 공간 표시 로직
                  const roomNames = [];
                  if (item.interiorLiving) roomNames.push("거실");
                  if (item.interiorKitchen) roomNames.push("주방");
                  if (item.interiorBed) roomNames.push("침실");
                  if (item.interiorOneroom) roomNames.push("원룸");
                  if (item.interiorKidroom) roomNames.push("아이방");
                  if (item.interiorStudy) roomNames.push("서재");

                  return (
                    <div className="sb-content" key={item.interiorNo}>
                      {/* 결제일 */}
                      <p
                        style={{
                          fontWeight: "bold",
                          fontSize: "18px",
                          marginTop: "20px",
                          marginBottom: "20px",
                        }}
                      >
                        결제일: {item.interiorPaymentDate}
                      </p>

                      {/* 결제 이미지 */}
                      <div className="img">
                        <img
                          src="/image/pay-img.png"
                          alt="결제 이미지"
                          style={{ borderRadius: "8px" }}
                        />
                      </div>

                      {/* 결제 정보 */}
                      <div
                        className="payment-info"
                        style={{ width: "100%", paddingBottom: "10px" }}
                      >
                        <p>디자이너 이름: {item.interiorDesignerName}</p>
                        <p>인테리어 이유: {item.interiorWhy}</p>
                        <p>가격: {item.interiorPrice.toLocaleString()}원</p>
                        <p>
                          디자이너 채팅:{" "}
                          <a
                            href={`${item.designerChat}`}
                            target="_blank"
                            id="sb-designer-chat"
                          >
                            {item.designerChat}
                          </a>
                        </p>
                        <div>
                          <p style={{ fontWeight: "600", fontSize: "17px" }}>
                            인테리어 공간:{" "}
                            {roomNames.length > 0
                              ? roomNames.join(", ")
                              : "없음"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 더보기 버튼: 보여주는 카드 수가 전체보다 적을 때만 표시 */}
              {visibleCount < payments.length && (
                <div className="load-more-wrap">
                  <button className="load-more" onClick={handleLoadMore}>
                    더보기
                  </button>
                </div>
              )}
            </>
          ) : (
            // 결제 내역이 없는 경우
            <p
              style={{ textAlign: "center", marginTop: "20px", width: "900px" }}
            >
              결제 내역이 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Payment; // Payment 컴포넌트 내보내기
