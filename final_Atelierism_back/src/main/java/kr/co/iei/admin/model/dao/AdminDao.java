package kr.co.iei.admin.model.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.admin.model.dto.AdminMonthSalesStatus;
import kr.co.iei.admin.model.dto.PriceListDto;
import kr.co.iei.interior.model.dto.InteriorDetailDTO;

@Mapper
public interface AdminDao {

	PriceListDto priceListSelect();

	int updatePriceList(PriceListDto priceList);

	List adminMemberList();

	List adminDesignerList();

	List adminApplicantList();

	int memberTotalCount();

	List selectMemberList(Map<String, Object> orderMap);

	List selectApplicantList(Map<String, Object> orderMap);

	int applicantTotalCount(String memOrder);

	List selectApplicantDetail(String memberId);

	List selectApplicantAward(String memberId);

	List selectApplicantCareer(String memberId);

	int refusalDesigner(String memberId);

	int enterDesigner(String memberId);

	int designerTotalCount(String memOrder);

	List selectDesignerList(Map<String, Object> orderMap);

	List applicantList();

	List topDesigner(String toMonth);

	AdminMonthSalesStatus selectSiteSubscriber(String monthDate);

	List chartSelect(int chartOrder);

	// ✅ 수정: monthDate를 전달받도록 변경
	List<InteriorDetailDTO> selectTotalOfSpace(String monthDate);

	AdminMonthSalesStatus selectMonthList(String monthDate);

	// ✅ 추가: detail 테이블 존재 여부 확인
	int countInteriorDetailData(String monthDate);

	// ✅ 추가: interior_tbl 데이터를 기반으로 detail 테이블 생성
	int insertInteriorDetailFromInterior(String monthDate);
}
