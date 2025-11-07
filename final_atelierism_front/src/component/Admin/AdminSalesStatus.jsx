import { useEffect, useState } from "react";
import "./AdminModal.css";
import SideMenu from "../utils/SideMenu";
import AdminChart from "./AdminChart";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AdminSalesStatus = () => {
  const today = new Date();
  const toMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;
  const backServer = import.meta.env.VITE_BACK_SERVER;
  const navigate = useNavigate();
  const [priceModal, setPriceModal] = useState(false);
  const [chartOrder, setChartOrder] = useState(2); //1: 3개월, 2: 6개월, 3: 년단위
  const [chartData, setChartData] = useState(null);
  const priceUpdate = () => {
    setPriceModal(true);
  };
  const [priceList, setPriceList] = useState(null); //가격표
  const [monthTotal, setMonthTotal] = useState(null); //이달의 통계
  const [spaceTotal, setSpaceTotal] = useState(null); //공간별 매출

  useEffect(() => {
    axios
      .get(`${backServer}/admin/list?toMonth=${toMonth}`)
      .then((res) => {
        console.log("관리자 매출 응답 : ",res.data)
        setPriceList(res.data.pl);
        setSpaceTotal(res.data.spaceTotal);
        setMonthTotal(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="admin-sales-status-allwrap">
      <div className="admin-sales-status-wrap">
        <section className="admin-sales-status-content">
          <div className="admin-sales-status-content-top">
            <div className="sales-chart">
              <h2>매출 그래프</h2>
              <div className="chart-zone">
                <AdminChart
                  data={chartOrder}
                  chartData={chartData}
                  setChartData={setChartData}
                />
              </div>
              <div className="sales-btn-zone">
                <button
                  type="button"
                  id="month-3"
                  className={chartOrder === 1 ? "inclick" : ""}
                  onClick={() => {
                    setChartOrder(1);
                    setChartData(null);
                  }}
                >
                  3개월
                </button>
                <button
                  type="button"
                  id="month-6"
                  className={chartOrder === 2 ? "inclick" : ""}
                  onClick={() => {
                    setChartOrder(2);
                    setChartData(null);
                  }}
                >
                  6개월
                </button>
                <button
                  type="button"
                  id="year-by-year"
                  className={chartOrder === 3 ? "inclick" : ""}
                  onClick={() => {
                    setChartOrder(3);
                    setChartData(null);
                  }}
                >
                  12개월
                </button>
              </div>
            </div>

            <div className="site-total">
              <h2>사이트 토탈</h2>
              {monthTotal != null && (
                <div className="total-table">
                  <table border={1}>
                    <tbody>
                      <tr>
                        <th>이달의 총 매출</th>
                        <td>{monthTotal?.totalOfMonth ?? 0}원</td>
                      </tr>
                      <tr>
                        <th>이달의 가입자</th>
                        <td>{monthTotal?.siteSubscriber ?? 0}명</td>
                      </tr>
                      <tr>
                        <th>사이트 순 매출</th>
                        <td>{monthTotal?.siteRevenue ?? 0}원</td>
                      </tr>
                      <tr>
                        <th>디자이너 매출</th>
                        <td>{monthTotal?.designerMonth ?? 0}원</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="admin-sales-status-content-bottom">
            <div className="space-sales">
              <h2>이달의 공간별 매출</h2>
              {Array.isArray(spaceTotal) && spaceTotal.length > 0 ? (
                <div className="space-sales-table">
                  <table border={1}>
                    <thead>
                      <tr>
                        <th>공간명</th>
                        <th>월매출</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>원룸</td>
                        <td>{spaceTotal?.[3]?.totalOfSpace ?? 0}원</td>
                      </tr>
                      <tr>
                        <td>거실</td>
                        <td>{spaceTotal?.[4]?.totalOfSpace ?? 0}원</td>
                      </tr>
                      <tr>
                        <td>부엌</td>
                        <td>{spaceTotal?.[2]?.totalOfSpace ?? 0}원</td>
                      </tr>
                      <tr>
                        <td>아이방</td>
                        <td>{spaceTotal?.[5]?.totalOfSpace ?? 0}원</td>
                      </tr>
                      <tr>
                        <td>안방</td>
                        <td>{spaceTotal?.[1]?.totalOfSpace ?? 0}원</td>
                      </tr>
                      <tr>
                        <td>서재</td>
                        <td>{spaceTotal?.[0]?.totalOfSpace ?? 0}원</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>📊 공간별 매출 데이터가 없습니다.</p>
              )}
            </div>

            {/*-------가격표-------------*/}
            {priceList !== null && (
              <div className="price-list">
                <h2>가격표</h2>
                <table>
                  <thead>
                    <tr>
                      <th>상품명</th>
                      <th>가격</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>원룸</td>
                      <td>{priceList?.priceOneroom ?? 0}원</td>
                    </tr>
                    <tr>
                      <td>거실</td>
                      <td>{priceList?.priceLiving ?? 0}원</td>
                    </tr>
                    <tr>
                      <td>부엌</td>
                      <td>{priceList?.priceKitchen ?? 0}원</td>
                    </tr>
                    <tr>
                      <td>아이방</td>
                      <td>{priceList?.priceKidroom ?? 0}원</td>
                    </tr>
                    <tr>
                      <td>안방</td>
                      <td>{priceList?.priceBed ?? 0}원</td>
                    </tr>
                    <tr>
                      <td>서재</td>
                      <td>{priceList?.priceStudy ?? 0}원</td>
                    </tr>
                    <tr>
                      <td>수수료</td>
                      <td>{priceList?.priceCharge ?? 0}%</td>
                    </tr>
                  </tbody>
                </table>
                <div className="sales-btn-zone">
                  <button type="button" id="price-update" onClick={priceUpdate}>
                    가격수정
                  </button>
                  {priceModal && (
                    <PriceUpdateModal
                      onClose={() => {
                        setPriceModal(false);
                      }}
                      priceList={priceList}
                      setPriceList={setPriceList}
                      backServer={backServer}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const PriceUpdateModal = ({ onClose, priceList, setPriceList, backServer }) => {
  const [inputPrice, setInputPrice] = useState({ ...priceList });
  const priceInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const newInputPrice = { ...inputPrice, [name]: value };
    setInputPrice(newInputPrice);
  };
  const updatePriceTable = () => {
    const newList = {};
    for (const listCheck in inputPrice) {
      if (inputPrice[listCheck] !== "0" && inputPrice[listCheck] !== "") {
        newList[listCheck] = inputPrice[listCheck];
      }
    }
    axios
      .patch(`${backServer}/admin`, newList)
      .then((res) => {
        if (res.data >= 1) {
          for (const key in newList) {
            priceList[key] = newList[key];
          }
          setPriceList({ ...priceList });
          setInputPrice({ ...priceList });
          Swal.fire({
            title: "가격변경 완료",
            icon: "success",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "가격변경 실패",
          icon: "warning",
        });
      });
  };
  return (
    <section className="price-modal-all-wrap">
      <div className="price-modal-wrap">
        <div className="price-modal-title">
          <h2>가격표 수정</h2>
        </div>
        <div className="price-modal-content">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updatePriceTable();
            }}
          >
            <table className="price-table-form">
              <thead>
                <tr>
                  <th>상품명</th>
                  <th>가격</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>원룸</td>
                  <td>
                    <input
                      type="text"
                      id="priceOneroom"
                      name="priceOneroom"
                      value={inputPrice.priceOneroom}
                      onChange={priceInput}
                    />
                  </td>
                </tr>
                <tr>
                  <td>거실</td>
                  <td>
                    <input
                      type="text"
                      id="priceLiving"
                      name="priceLiving"
                      value={inputPrice.priceLiving}
                      onChange={priceInput}
                    />
                  </td>
                </tr>
                <tr>
                  <td>부엌</td>
                  <td>
                    <input
                      type="text"
                      id="priceKitchen"
                      name="priceKitchen"
                      value={inputPrice.priceKitchen}
                      onChange={priceInput}
                    />
                  </td>
                </tr>
                <tr>
                  <td>아이방</td>
                  <td>
                    <input
                      type="text"
                      id="priceKidroom"
                      name="priceKidroom"
                      value={inputPrice.priceKidroom}
                      onChange={priceInput}
                    />
                  </td>
                </tr>
                <tr>
                  <td>안방</td>
                  <td>
                    <input
                      type="text"
                      id="priceBed"
                      name="priceBed"
                      value={inputPrice.priceBed}
                      onChange={priceInput}
                    />
                  </td>
                </tr>
                <tr>
                  <td>서재</td>
                  <td>
                    <input
                      type="text"
                      id="priceStudy"
                      name="priceStudy"
                      value={inputPrice.priceStudy}
                      onChange={priceInput}
                    />
                  </td>
                </tr>
                <tr>
                  <td>수수료</td>
                  <td>
                    <input
                      type="text"
                      id="priceCharge"
                      name="priceCharge"
                      value={inputPrice.priceCharge}
                      onChange={priceInput}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="modal-btn-zone">
              <button type="button" id="update-cancel" onClick={onClose}>
                취소
              </button>
              <button type="submit" id="update-ok" onClick={updatePriceTable}>
                확인
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AdminSalesStatus;
