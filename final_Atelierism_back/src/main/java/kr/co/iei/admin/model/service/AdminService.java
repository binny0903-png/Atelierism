package kr.co.iei.admin.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.iei.admin.model.dao.AdminDao;
import kr.co.iei.admin.model.dto.AdminMonthSalesStatus;
import kr.co.iei.admin.model.dto.PriceListDto;
import kr.co.iei.util.PageInfo;
import kr.co.iei.util.PageInfoUtils;

@Service
public class AdminService {
	
	@Autowired
	private AdminDao adminDao;
	@Autowired
	private PageInfoUtils pageInfoUtils;

	public Map selectSalesStateList(String monthDate) {
	    Map<String, Object> salesStateList = new HashMap<>();

	    // ✅ 1. 기본 매출/가입자/단가 정보 조회
	    AdminMonthSalesStatus salesStatus = adminDao.selectMonthList(monthDate);
	    AdminMonthSalesStatus subscriberMonth = adminDao.selectSiteSubscriber(monthDate);
	    PriceListDto pl = adminDao.priceListSelect();

	    // ✅ 2. interior_detail_tbl 데이터가 없으면 interior_tbl 기반으로 생성
	    int detailCount = adminDao.countInteriorDetailData(monthDate);
	    if (detailCount == 0) {
	        adminDao.insertInteriorDetailFromInterior(monthDate);
	    }

	    // ✅ 3. 공간별 매출 조회 (생성 후 실행)
	    List spaceTotal = adminDao.selectTotalOfSpace(monthDate);

	    // ✅ 4. Map 구성
	    salesStateList.put("salesStatus", salesStatus);
	    salesStateList.put("subscriberMonth", subscriberMonth);
	    salesStateList.put("pl", pl);
	    salesStateList.put("spaceTotal", spaceTotal);
	    return salesStateList;
	}

	public Map myPageList(String toMonth) {
		Map<String, Object> myPageList = new HashMap<String, Object>();
		List applicantList = adminDao.applicantList();
		List topDesignerList = adminDao.topDesigner(toMonth);
		myPageList.put("applicantList", applicantList);
		myPageList.put("topDesignerList", topDesignerList);
		return myPageList;
	}
	
	public PriceListDto priceListSelect() {
		PriceListDto pl = adminDao.priceListSelect();
		return pl;
	}

	@Transactional
	public int updatePriceList(PriceListDto priceList) {
		int result = adminDao.updatePriceList(priceList);
		return result;
	}

	public Map selectBoardList(int reqPage, String memOrder) {
		int numPerPage = 10;
		int pageNaviSize = 5;
		int totalCount = 0;
		if(memOrder.equals("m1")||memOrder.equals("m2")) {
			totalCount = adminDao.memberTotalCount();
		} else if(memOrder.equals("a1")||memOrder.equals("a2")||memOrder.equals("a3")) {
			totalCount = adminDao.applicantTotalCount(memOrder);
		} else if(memOrder.equals("d1")||memOrder.equals("d2")||memOrder.equals("d3")) {
			totalCount = adminDao.designerTotalCount(memOrder);
		}
		PageInfo pi = pageInfoUtils.getPageInfo(reqPage, numPerPage, pageNaviSize, totalCount);
		Map<String, Object> orderMap = new HashMap<String, Object>();
		orderMap.put("start",pi.getStart());
		orderMap.put("end", pi.getEnd());
		orderMap.put("memOrder", memOrder);
		if(memOrder.equals("m1")||memOrder.equals("m2")) {
			List reqList = adminDao.selectMemberList(orderMap);
			Map<String, Object> map = new HashMap<String,Object>();
			map.put("reqList", reqList);
			map.put("pi", pi);
			return map;
		}else if(memOrder.equals("a1")||memOrder.equals("a2")||memOrder.equals("a3")) {
			List reqList = adminDao.selectApplicantList(orderMap);
			Map<String, Object> map = new HashMap<String,Object>();
			map.put("reqList", reqList);
			map.put("pi", pi);
			return map;
		}else {
			List reqList = adminDao.selectDesignerList(orderMap);
			Map<String, Object> map = new HashMap<String,Object>();
			map.put("reqList", reqList);
			map.put("pi", pi);
			return map;
		}
	}

	public Map selectApplicantDetailList(String memberId) {
		List applicantDetail = adminDao.selectApplicantDetail(memberId);
		List applicantAward = adminDao.selectApplicantAward(memberId);
		List applicantCareer = adminDao.selectApplicantCareer(memberId);
		Map<String, Object> detail = new HashMap<String, Object>();
		detail.put("applicantDetail", applicantDetail);
		detail.put("applicantAward", applicantAward);
		detail.put("applicantCareer", applicantCareer);
		return detail;
	}
	
	@Transactional
	public int refusalDesigner(String memberId) {
		int result = adminDao.refusalDesigner(memberId);
		return result;
	}

	@Transactional
	public int enterDesigner(String memberId) {
		int result = adminDao.enterDesigner(memberId);
		return result;
	}

	public List chartSelect(int chartOrder) {
		List chartData = adminDao.chartSelect(chartOrder);
		return chartData;
	}

}
