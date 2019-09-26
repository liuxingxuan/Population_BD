using Readearth.Data;
using System;
using System.Data;
using System.Configuration;
using System.IO;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using ExcelDataReader;

namespace WcfService.ServiceImpl
{
    public partial class ServiceImpl
    {
        Database db = new Database();

        public class Result
        {
            public string result { get; set; }
            public string data { get; set; }
        }

        public string Test()
        {
            string r = "";
            
            return r;
        }

        public class BusinessDistrict
        {
            public string Name { get; set; }
            public string Class { get; set; }
            public string District { get; set; }
            public ArrayList Sub { get; set; }
        }
        public class SubBD
        {
            public string Area { get; set; }
            public string District { get; set; }
            public string Lon { get; set; }
            public string Lat { get; set; }
            public double Slope { get; set; }
        }
        //获取上海商圈数据
        public ArrayList GetSHSQData(string district)
        {
            try
            {
                ArrayList bdList = new ArrayList();
                string sql = "Select Name,b.MC as Class,c.MC as District from (select Name,Avg(ClassCode) as CC,AVG(DistrictCode) as DC from T_BusinessDistrict GROUP BY Name) a inner JOIN D_BusinessDistrictClass b on a.CC = b.DM inner join D_District c on c.DM = a.DC";
                if(district != null && district != "")
                {
                    sql += " where c.MC = '" + district + "'";
                }
                DataTable bd = db.GetDataTable(sql);
               
                foreach (DataRow dr in bd.Rows)
                {
                    BusinessDistrict BDis = new BusinessDistrict();
                    BDis.Name = dr[0].ToString();
                    BDis.Class = dr[1].ToString();
                    BDis.District = dr[2].ToString();
                    BDis.Sub = new ArrayList();
                    DataTable subTable = db.GetDataTable("select * from T_BusinessDistrict a left join D_District b on a.districtcode = b.dm where Name = '" + BDis.Name + "'");
                    foreach (DataRow drs in subTable.Rows)
                    {
                        SubBD sBD = new SubBD();
                        sBD.Area = drs["Area"].ToString();
                        sBD.District = drs["MC"].ToString();
                        sBD.Lon = drs["Longitude"].ToString();
                        sBD.Lat = drs["Latitude"].ToString();
                        BDis.Sub.Add(sBD);
                    }
                    CalculateSlope(BDis.Sub);
                    bdList.Add(BDis);
                }
                return bdList;
            }
            catch (Exception ex)
            {
                ArrayList r = new ArrayList();
                r.Add(ex.Message + "||" + ex.StackTrace);
                return r;
            }
        }
        //计算商圈各个点的正切值
        public ArrayList CalculateSlope(ArrayList bdlist)
        {
            double cLon = 0;
            double cLat = 0;
            foreach (SubBD bd in bdlist)
            {
                double Lon = Convert.ToDouble(bd.Lon);
                if(Lon > cLon)
                {
                    cLon = Lon;
                    cLat = Convert.ToDouble(bd.Lat);
                }
            }
            foreach (SubBD bd in bdlist)
            {
                double Lon = Convert.ToDouble(bd.Lon);
                double Lat = Convert.ToDouble(bd.Lat);
                double slope = (cLat - Lat) / (cLon - Lon);
                bd.Slope = slope;
            }
            return bdlist;
        }

        public class YDXFData
        {
            public string result { get; set; }
            public ArrayList In { get; set; }
            public ArrayList Out { get; set; }
            public DataTable InIndustry { get; set; }
            public DataTable OutIndustry { get; set; }

            public YDXFData()
            {
                this.In = new ArrayList();
                this.Out = new ArrayList();
            }
        }
        public class YDXFCityData
        {
            public string Name { get; set; }
            public double Sum { get; set; }
            public string Longitude { get; set; }
            public string Latitude { get; set; }
            public ArrayList Industry { get; set; }
            public YDXFCityData()
            {
                this.Industry = new ArrayList();
            }
        }
        //获取异地消费数据
        public YDXFData GetYDXFData(string Time)
        {
            try
            {
                YDXFData result = new YDXFData();
                ArrayList In = new ArrayList();
                ArrayList Out = new ArrayList();
                DateTime time = Convert.ToDateTime(Time);
                string sql = "select top 10 Sum(Sum) as Sum,TargetCity,Max(Longitude) as Longitude,Max(Latitude) as Latitude from T_NonLocalConsumption a left join T_CityLocation b on a.TargetCity = b.Name where OriginCity = '上海市' and TargetCity != '上海市' and Time = '" + time + "' group by TargetCity order by Sum desc; select top 10 Sum(Sum) as Sum,OriginCity,Max(Longitude) as Longitude,Max(Latitude) as Latitude from T_NonLocalConsumption a left join T_CityLocation b on a.OriginCity = b.Name where OriginCity != '上海市' and TargetCity = '上海市' and Time = '" + time + "' group by OriginCity order by Sum desc;select top 5 Sum(Sum) as Sum,Industry from T_NonLocalConsumption where OriginCity = '上海市' and TargetCity != '上海市' and Time = '" + time + "' group by Industry order by Sum desc;select top 5 Sum(Sum) as Sum,Industry from T_NonLocalConsumption where OriginCity != '上海市' and TargetCity = '上海市' and Time = '" + time + "' group by Industry order by Sum desc";
                DataSet ds = db.GetDataset(sql);
                ds.Tables[0].TableName = "Out";
                ds.Tables[1].TableName = "In";
                ds.Tables[2].TableName = "OutIndustry";
                ds.Tables[3].TableName = "InIndustry";
                double Sum = Convert.ToDouble(db.GetFirstValue("select Sum(Sum) from T_NonLocalConsumption where OriginCity = '上海市' and TargetCity != '上海市' and Time = '" + time + "' group by time;"));
                foreach(DataRow dr in ds.Tables[0].Rows)
                {
                    YDXFCityData yc = new YDXFCityData();
                    dr["Sum"] = Convert.ToDouble(dr["Sum"]) / Sum * 100;
                    yc.Name = dr["TargetCity"].ToString();
                    yc.Sum = Convert.ToDouble(dr["Sum"]);
                    yc.Longitude = dr["Longitude"].ToString();
                    yc.Latitude = dr["Latitude"].ToString();
                    DataTable dt1 = db.GetDataTable("select * from T_NonLocalConsumption where OriginCity = '上海市' and TargetCity = '" + yc.Name + "' and Time = '" + time + "'");
                    foreach (DataRow dr1 in dt1.Rows)
                    {
                        YDXFCityIndustryData yci = new YDXFCityIndustryData();
                        yci.Name = dr1["Industry"].ToString();
                        yci.Sum = Convert.ToDouble(dr1["Sum"]) / Sum * 100;
                        yc.Industry.Add(yci);
                    }
                    Out.Add(yc);
                }
                foreach (DataRow dr in ds.Tables[2].Rows)
                {
                    dr["Sum"] = Convert.ToDouble(dr["Sum"]) / Sum * 100;
                }
                Sum = Convert.ToDouble(db.GetFirstValue("select Sum(Sum) from T_NonLocalConsumption where OriginCity != '上海市' and TargetCity = '上海市' and Time = '" + time + "' group by time;"));
                foreach (DataRow dr in ds.Tables[1].Rows)
                {
                    YDXFCityData yc = new YDXFCityData();
                    dr["Sum"] = Convert.ToDouble(dr["Sum"]) / Sum * 100;
                    yc.Name = dr["OriginCity"].ToString();
                    yc.Sum = Convert.ToDouble(dr["Sum"]);
                    yc.Longitude = dr["Longitude"].ToString();
                    yc.Latitude = dr["Latitude"].ToString();
                    DataTable dt1 = db.GetDataTable("select * from T_NonLocalConsumption where TargetCity = '上海市' and OriginCity = '" + yc.Name + "' and Time = '" + time + "'");
                    foreach (DataRow dr1 in dt1.Rows)
                    {
                        YDXFCityIndustryData yci = new YDXFCityIndustryData();
                        yci.Name = dr1["Industry"].ToString();
                        yci.Sum = Convert.ToDouble(dr1["Sum"]) / Sum * 100;
                        yc.Industry.Add(yci);
                    }
                    In.Add(yc);
                }
                foreach (DataRow dr in ds.Tables[3].Rows)
                {
                    dr["Sum"] = Convert.ToDouble(dr["Sum"]) / Sum * 100;
                }
                result.OutIndustry = ds.Tables[2];
                result.InIndustry = ds.Tables[3];
                result.In = In;
                result.Out = Out;
                return result;
            }
            catch (Exception ex)
            {
                YDXFData r = new YDXFData();
                r.result = ex.Message + "||" + ex.StackTrace;
                return r;
            }
        }

        public Result GetYDXFPieData(string Time,string City,string Type)
        {
            Result result = new Result();
            try
            {
                string sql = "";
                if(Type == "In")
                {
                    sql = "select top 5 Sum(Sum) as Sum,Industry from T_NonLocalConsumption where OriginCity = '" + City + "' and TargetCity = '上海市' and Time = '" + Time + "' group by Industry order by Sum desc";
                }
                else
                {
                    sql = "select top 5 Sum(Sum) as Sum,Industry from T_NonLocalConsumption where OriginCity = '上海市' and TargetCity = '" + City + "' and Time = '" + Time + "' group by Industry order by Sum desc";
                }
                DataTable dt = db.GetDataTable(sql);
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(dt);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        public class IndustryConsumption
        {
            public string Name { get; set; }
            public double Sum { get; set; }
            public double CardTime { get; set; }
            public double CardSum { get; set; }
        }
        public class DistrictConsumption
        {
            public string Name { get; set; }
            public double Sum { get; set; }
            public ArrayList IndustryList { get; set; }
            public int Code { get; set; }
            public int BDNum { get; set; }
        }
        //获取区县销售额数据
        public ArrayList GetQXSSEData(string time,string name)
        {
            try
            {
                ArrayList List = new ArrayList();
                string existD = "";
                string sql = "select * from T_DistrictConsumption a left join D_District b on a.DistrictCode = b.DM where time = '" + time + "'";
                if(name != "All")
                {
                    sql += " and b.MC = '" + name + "'"; 
                }
                DataTable dt = db.GetDataTable(sql);
                foreach(DataRow dr in dt.Rows)
                {
                    string District = dr["MC"].ToString();
                    if(existD.IndexOf(District) < 0)
                    {
                        existD += District + ",";
                        DistrictConsumption DC = new DistrictConsumption();
                        DC.Name = District;
                        DC.Sum = 0;
                        DC.Code = Convert.ToInt32(dr["DM"]);
                        DC.IndustryList = new ArrayList();
                        IndustryConsumption IC = new IndustryConsumption();
                        IC.Name = dr["Industry"].ToString();
                        IC.Sum = Convert.ToDouble(dr["Sum"]);
                        //IC.CardSum = Convert.ToDouble(dr["CardSum"]);
                        //IC.CardTime = Convert.ToDouble(dr["CardTime"]);
                        DC.Sum += IC.Sum;
                        DC.IndustryList.Add(IC);
                        List.Add(DC);
                    }
                    else
                    {
                        foreach(DistrictConsumption DC in List)
                        {
                            if(DC.Name == dr["MC"].ToString())
                            {
                                IndustryConsumption IC = new IndustryConsumption();
                                IC.Name = dr["Industry"].ToString();
                                IC.Sum = Convert.ToDouble(dr["Sum"]);
                                //IC.CardSum = Convert.ToDouble(dr["CardSum"]);
                                //IC.CardTime = Convert.ToDouble(dr["CardTime"]);
                                DC.Sum += IC.Sum;
                                DC.IndustryList.Add(IC);
                            }
                        }
                    }
                }

                DataTable BDNumTable = db.GetDataTable("select DistrictCode,count(districtcode) as BDNum from T_BusinessDistrict group by DistrictCode");
                foreach(DataRow dr1 in BDNumTable.Rows)
                {
                    foreach(DistrictConsumption DC in List)
                    {
                        if(DC.Code == Convert.ToInt32(dr1["DistrictCode"]))
                        {
                            DC.BDNum = Convert.ToInt32(dr1["BDNum"]);
                        }
                    }
                }

                double DistrictSum = Convert.ToDouble(db.GetFirstValue("select Sum(sum) from T_DistrictConsumption where Time = '" + time + "' group by Time"));
                foreach(DistrictConsumption DC in List)
                {
                    foreach(IndustryConsumption IC in DC.IndustryList)
                    {
                        IC.Sum = IC.Sum / DC.Sum * 100;
                    }
                    DC.Sum = DC.Sum / DistrictSum * 100;
                }
                return List;
            }
            catch (Exception ex)
            {
                ArrayList r = new ArrayList();
                r.Add(ex.Message + "||" + ex.StackTrace);
                return r;
            }
        }

        //上海市销售额
        public Result GetSHConsumption(string time)
        {
            Result result = new Result();
            try
            {
                string sql = string.Format("select Sum,MC from (select DistrictCode,SUM(Sum) as Sum from T_DistrictConsumption where Time = '{0}' group by DistrictCode) a inner join D_District b on a.DistrictCode = b.DM order by SUM desc", time);
                DataTable xse = db.GetDataTable(sql);
                double max = Convert.ToDouble(db.GetFirstValue(string.Format("select SUM(Sum) as Sum from T_DistrictConsumption where Time = '{0}' order by Sum desc", time)));
                foreach (DataRow dr in xse.Rows)
                {
                    dr["Sum"] = Convert.ToDouble(dr["Sum"]) / max * 100;
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(xse);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //上海市客流
        public Result GetSHFlow(string time)
        {
            Result result = new Result();
            try
            {
                DateTime startDate = Convert.ToDateTime(time);
                DateTime endDate = startDate.AddMonths(1);
                string sql = string.Format("select MC,AVG(Sum) as Sum from (select Time,a.Name,Local,DistrictCode,AVG(Density) as Sum from T_BDCustomerFlow a inner join T_BusinessDistrict b on a.Name = b.Name where Time >= '{0}' and Time < '{1}' group by a.Name,a.Time,a.Local,DistrictCode) c inner join D_District d on c.DistrictCode = d.DM group by MC order by Sum desc", startDate, endDate);
                DataTable flow = db.GetDataTable(sql);
                double max = Convert.ToDouble(flow.Rows[0]["Sum"]);
                foreach (DataRow dr in flow.Rows)
                {
                    dr["Sum"] = Convert.ToDouble(dr["Sum"]) / max * 100;
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(flow);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //上海市转化率 
        public Result GetSHZHL(string time)
        {
            Result result = new Result();
            try
            {
                string sql = string.Format("select MC,SUM(TradeTime) as TradeTime from (select a.Name,Avg(TradeTime) as TradeTime,industry,AVG(DistrictCode) as DistrictCode from T_IndustryTrade a inner join T_BusinessDistrict b on a.Name = b.Name where Time = '{0}' group by a.Name, industry) c inner join D_District d on c.DistrictCode = d.DM group by MC order by TradeTime desc", time);
                DataTable tradeTime = db.GetDataTable(sql);

                DateTime startDate = Convert.ToDateTime(time);
                DateTime endDate = startDate.AddMonths(1);
                sql = string.Format("select MC,Sum(Sum) as Sum from (select Time,a.Name,Local,DistrictCode,AVG(Sum) as Sum from T_BDCustomerFlow a inner join T_BusinessDistrict b on a.Name = b.Name where Time >= '{0}' and Time < '{1}' group by a.Name,a.Time,a.Local,DistrictCode) c inner join D_District d on c.DistrictCode = d.DM group by MC order by Sum desc", startDate, endDate);
                DataTable flow = db.GetDataTable(sql);

                DataTable zhl = db.GetDataTable("select top 0 MC,Sum from T_DistrictConsumption a inner join D_District b on a.DistrictCode = b.DM");

                foreach (DataRow dr1 in flow.Rows)
                {
                    foreach (DataRow dr2 in tradeTime.Rows)
                    {
                        if (dr1["MC"].ToString() == dr2["MC"].ToString())
                        {
                            DataRow ndr = zhl.NewRow();
                            ndr["MC"] = dr2["MC"].ToString();
                            ndr["Sum"] = Convert.ToDouble(dr2["TradeTime"]) / Convert.ToDouble(dr1["Sum"]);
                            zhl.Rows.Add(ndr);
                        }
                    }
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(zhl);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //上海市业态占比
        public Result GetSHIndustry(string time)
        {
            Result result = new Result();
            try
            {
                string sql = string.Format("select Sum(Sum) as Sum,Industry from T_DistrictConsumption a left join D_District b on a.DistrictCode = b.DM where Time = '{0}' group by Industry order by Sum desc", time); ;
                DataTable table = db.GetDataTable(sql);
                double max = 0;
                foreach(DataRow dr in table.Rows)
                {
                    max += Convert.ToDouble(dr["Sum"]);
                }
                foreach (DataRow dr in table.Rows)
                {
                    dr["Sum"] = Convert.ToDouble(dr["Sum"]) / max * 100;
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(table);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //上海市人口
        public Result GetSHPopulation()
        {
            Result result = new Result();
            try
            {
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(db.GetDataTable("select * from T_DistrictPopulation a left join D_District b on a.DistrictCode = b.DM"));
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //上海市交通便利
        public Result GetSHTrafficIndex()
        {
            Result result = new Result();
            try
            {
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(db.GetDataTable("select * from T_DistrictTrafficIndex a left join D_District b on a.DistrictCode = b.DM order by TrafficIndex desc"));
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //区内销售额
        public Result GetDistrictConsumption(string name,string time)
        {
            Result result = new Result();
            try
            {
                string sql = string.Format("select Name,Sum(Sum) as Sum,d.MC from (select a.Name,Avg(TradeSum) as Sum,Industry,AVG(DistrictCode) as DistrictCode from T_IndustryTrade a inner join T_BusinessDistrict b on a.Name = b.Name where Time = '{0}' group by a.Name, Industry) c inner join D_District d on c.DistrictCode = d.DM where MC = '{1}' group by Name,MC order by Sum desc", time, name);
                DataTable xse = db.GetDataTable(sql);
                double max = Convert.ToDouble(db.GetFirstValue(string.Format("select Sum(Sum) as Sum from (select a.Name,Avg(TradeSum) as Sum,Industry,AVG(DistrictCode) as DistrictCode from T_IndustryTrade a inner join T_BusinessDistrict b on a.Name = b.Name where Time = '{0}' group by a.Name, Industry) c inner join D_District d on c.DistrictCode = d.DM where MC = '{1}' group by MC", time, name)));
                foreach (DataRow dr in xse.Rows)
                {
                    dr["Sum"] = Convert.ToDouble(dr["Sum"]) / max * 100;
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(xse);
                return result;
            }
            catch(Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //区内业态占比
        public Result GetDistricIndustry(string name, string time)
        {
            Result result = new Result();
            try
            {
                double max = Convert.ToDouble(db.GetFirstValue(string.Format("select Sum(Sum) as Sum from (select a.Name,Avg(TradeSum) as Sum,Industry,AVG(DistrictCode) as DistrictCode from T_IndustryTrade a inner join T_BusinessDistrict b on a.Name = b.Name where Time = '{0}' group by a.Name, Industry) c inner join D_District d on c.DistrictCode = d.DM where MC = '{1}' group by MC", time, name)));
                string sql = string.Format("select Sum(Sum) as Sum,Industry from (select a.Name,Avg(TradeSum) as Sum,Industry,AVG(DistrictCode) as DistrictCode from T_IndustryTrade a inner join T_BusinessDistrict b on a.Name = b.Name where Time = '{0}'group by a.Name, Industry) c inner join D_District d on c.DistrictCode = d.DM where MC = '{1}' group by Industry order by Sum desc", time, name);
                DataTable industry = db.GetDataTable(sql);
                foreach (DataRow dr in industry.Rows)
                {
                    dr["Sum"] = Convert.ToDouble(dr["Sum"]) / max * 100;
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(industry);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //区内客流
        public Result GetDistrictFlow(string name, string time)
        {
            Result result = new Result();
            try
            {
                DateTime t = Convert.ToDateTime(time);
                string startDate = t.ToString("yyyy-MM-01");
                string endDate = t.AddMonths(1).ToString("yyyy-MM-01");
                string sql = string.Format("select Name,Sum(Sum) as Sum from (select Time,a.Name,Local,DistrictCode,AVG(Density) as Sum from T_BDCustomerFlow a inner join T_BusinessDistrict b on a.Name = b.Name where Time >= '{0}' and Time < '{1}' group by a.Name,a.Time,a.Local,DistrictCode) c inner join D_District d on c.DistrictCode = d.DM where MC = '{2}' group by Name order by Sum desc", startDate, endDate, name);
                DataTable flow = db.GetDataTable(sql);
                double max = Convert.ToDouble(db.GetFirstValue(string.Format("select Sum(Sum) as Sum from (select Time,a.Name,Local,DistrictCode,AVG(Density) as Sum from T_BDCustomerFlow a inner join T_BusinessDistrict b on a.Name = b.Name where Time >= '{0}' and Time < '{1}' group by a.Name,a.Time,a.Local,DistrictCode) c inner join D_District d on c.DistrictCode = d.DM where MC = '{2}' group by MC ", startDate, endDate, name)));
                foreach (DataRow dr in flow.Rows)
                {
                    dr["Sum"] = Convert.ToDouble(dr["Sum"]) / max * 100;
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(flow);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //区内转化率
        public Result GetDistrictZHL(string name,string time)
        {
            Result result = new Result();
            try
            {
                DateTime t = Convert.ToDateTime(time);
                string startDate = t.ToString("yyyy-MM-01");
                string endDate = t.AddMonths(1).ToString("yyyy-MM-01");
                string sql = string.Format("select Name,Sum(Sum) as Sum from (select Time,a.Name,Local,DistrictCode,AVG(Sum) as Sum from T_BDCustomerFlow a inner join T_BusinessDistrict b on a.Name = b.Name where Time >= '{0}' and Time < '{1}' group by a.Name,a.Time,a.Local,DistrictCode) c inner join D_District d on c.DistrictCode = d.DM where MC = '{2}' group by Name order by Sum desc", startDate, endDate, name);
                DataTable flow = db.GetDataTable(sql);
                sql = string.Format("select Name,SUM(TradeTime) as TradeTime from (select a.Name,Avg(TradeTime) as TradeTime,industry,AVG(DistrictCode) as DistrictCode from T_IndustryTrade a inner join T_BusinessDistrict b on a.Name = b.Name where Time = '{0}' group by a.Name, industry) c inner join D_District d on c.DistrictCode = d.DM where D.MC = '{1}' group by Name order by TradeTime desc", time, name);
                DataTable tradeTime = db.GetDataTable(sql);

                DataTable zhl = db.GetDataTable("select top 0 MC,Sum from T_DistrictConsumption a inner join D_District b on a.DistrictCode = b.DM");
                foreach (DataRow dr1 in flow.Rows)
                {
                    foreach (DataRow dr2 in tradeTime.Rows)
                    {
                        if (dr1["Name"].ToString() == dr2["Name"].ToString())
                        {
                            DataRow ndr = zhl.NewRow();
                            ndr["MC"] = dr2["Name"].ToString();
                            ndr["Sum"] = Convert.ToDouble(dr2["TradeTime"]) / Convert.ToDouble(dr1["Sum"]);
                            zhl.Rows.Add(ndr);
                        }
                    }
                }

                result.result = "ok";
                result.data = JsonConvert.SerializeObject(zhl);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //区内商圈周边人口
        public Result GetDistrictBDPopulation (string name, string time)
        {
            Result result = new Result();
            try
            {
                string sql = string.Format("select a.Name,AVG(Population) as Population,AVG(Density) as Density from T_BDPopulation a inner join T_BusinessDistrict b on a.Name = b.Name inner join D_District c on b.DistrictCode = c.DM where c.MC = '{0}' and a.Time = '{1}' group by a.Name order by Population desc", name, time);
                DataTable pop = db.GetDataTable(sql);
                double max = Convert.ToDouble(pop.Rows[0]["Population"]);
                double dmax = Convert.ToDouble(db.GetFirstValue(string.Format("select AVG(Density) as Density from T_BDPopulation a inner join T_BusinessDistrict b on a.Name = b.Name inner join D_District c on b.DistrictCode = c.DM where c.MC = '{0}' and a.Time = '{1}' group by a.Name order by Density desc", name, time)));
                foreach (DataRow dr in pop.Rows)
                {
                    dr["Population"] = Convert.ToDouble(dr["Population"]) / max * 100;
                    dr["Density"] = Convert.ToDouble(dr["Density"]) / dmax * 100;
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(pop);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //区内商圈交通便利指数
        public Result GetDistrictBDTrafficIndex(string name)
        {
            Result result = new Result();
            try
            {
                string sql = string.Format("select a.Name,Avg(Num) as Num from T_BDTrafficIndex a inner join T_BusinessDistrict b on a.Name = b.Name inner join D_District c on b.DistrictCode = c.DM where c.MC = '{0}' group by a.Name order by Num desc", name);
                DataTable table = db.GetDataTable(sql);
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(table);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        public DataSet GetDistrictDataTime()
        {
            try {
                DataSet ds = new DataSet();
                DataTable year = db.GetDataTable("select distinct(DATEPART(yyyy,Time)) as year from T_IndustryTrade order by year desc");
                year.TableName = "year";
                ds.Tables.Add(year);

                DataTable month = db.GetDataTable("select distinct(DATEPART(MM,Time)) as month from T_IndustryTrade order by month");
                month.TableName = "month";
                ds.Tables.Add(month);

                return ds;
            }
            catch (Exception ex)
            {
                DataSet ds = new DataSet();
                DataTable dt = new DataTable();
                dt.Columns.Add("error");
                DataRow dr = dt.NewRow();
                dr[0] = ex.Message + "||" + ex.StackTrace;
                dt.Rows.Add(dr);
                ds.Tables.Add(dt);
                return ds;
            }
        }

        public DataTable GetDistrictBD(string name)
        {
            try
            {
                return db.GetDataTable("select distinct(Name),classcode,MC from T_BusinessDistrict a left join D_District b on a.DistrictCode = b.DM where MC = '" + name + "' order by ClassCode,Name");
            }
            catch (Exception ex)
            {
                DataTable dt = new DataTable();
                dt.Columns.Add("error");
                DataRow dr = dt.NewRow();
                dr[0] = ex.Message + "||" + ex.StackTrace;
                dt.Rows.Add(dr);
                return dt;
            }
        }

        //商圈包含主要商业体,销售额全市排名及区内排名，客流指数，交通便利
        public class BusinessDistrictStatistics
        {
            public string Name { get; set; }
            public double Flow { get; set; }
            public double Traffic { get; set; }
            public int MID { get; set; }
            public int CityRank { get; set; }
            public int CityTotal { get; set; }
            public int DistrictRank { get; set; }
            public int DistrictTotal { get; set; }
            public string Class { get; set; }
            public string Area { get; set; }
        }
        public Result GetBDInfo(string name,string time)
        {
            Result result = new Result();
            try
            {
                BusinessDistrictStatistics bds = new BusinessDistrictStatistics();
                if(time == "all")
                {
                    DataTable dt;
                    string ss = String.Format("select AVG(Density) from T_BDCustomerFlow where Name = '{0}' group by Name", name);
                    bds.Flow = Convert.ToDouble(db.GetFirstValue(ss));
                    double sumMax = Convert.ToDouble(db.GetFirstValue(String.Format("select top 1 AVG(Density) as Sum from T_BDCustomerFlow group by Name order by Sum desc")));
                    bds.Flow = bds.Flow / sumMax * 100;

                    string sql = string.Format("select aName,a.TradeSum,a.MID,b.DistrictCode from (select Max(Name) as aName,SUM(TradeSum) as TradeSum,Sum(MID) as MID from T_IndustryTrade group by Name) a inner join (select MAX(DistrictCode) as DistrictCode, Name as bName from T_BusinessDistrict group by Name) b on aName = bName order by a.TradeSum desc");
                    dt = db.GetDataTable(sql);
                    int dCode = 0;
                    foreach (DataRow dr in dt.Rows)
                    {
                        if (dr["aName"].ToString() == name)
                        {
                            dCode = Convert.ToInt32(dr["DistrictCode"]);
                        }
                    }

                    int cityRank = 0;
                    int DistrictRank = 0;
                    foreach (DataRow dr in dt.Rows)
                    {
                        cityRank++;
                        if (dCode == Convert.ToInt32(dr["DistrictCode"]))
                        {
                            DistrictRank++;
                        }
                        if (dr["aName"].ToString() == name)
                        {
                            bds.Name = name;
                            bds.CityRank = cityRank;
                            bds.DistrictRank = DistrictRank;
                            bds.MID = Convert.ToInt32(dr["MID"]);
                        }
                    }
                    bds.CityTotal = cityRank;
                    bds.DistrictTotal = DistrictRank;
                    sql = "select * from T_BusinessDistrict a left join D_BusinessDistrictClass b on a.ClassCode = b.DM where Name = '" + name + "'";
                    dt = db.GetDataTable(sql);
                    bds.Class = dt.Rows[0]["MC"].ToString();
                    foreach (DataRow dr in dt.Rows)
                    {
                        bds.Area += dr["Area"].ToString() + "/";
                    }

                    string trafficIndex = db.GetFirstValue("select Num from T_BDTrafficIndex where Name = '" + name + "'").ToString();
                    if (trafficIndex != "")
                    {
                        bds.Traffic = Convert.ToDouble(trafficIndex);
                    }
                    else
                    {
                        bds.Traffic = 0;
                    }
                }
                else
                {
                    DateTime t = Convert.ToDateTime(time);
                    string startDate = t.ToString("yyyy-MM-01");
                    string endDate = t.AddMonths(1).ToString("yyyy-MM-01");
                    DataTable dt;
                    string ss = String.Format("select AVG(Density) from T_BDCustomerFlow where Name = '{0}' and Time >= '{1}' and  Time < '{2}' group by Name", name, startDate, endDate);
                    bds.Flow = Convert.ToDouble(db.GetFirstValue(ss));
                    double sumMax = Convert.ToDouble(db.GetFirstValue(String.Format("select top 1 AVG(Density) as Sum from T_BDCustomerFlow where Time >= '{0}' and  Time < '{1}' group by Name order by Sum desc", startDate, endDate)));
                    bds.Flow = bds.Flow / sumMax * 100;

                    string sql = string.Format("select aName,a.TradeSum,a.MID,b.DistrictCode from (select Max(Name) as aName,SUM(TradeSum) as TradeSum,Sum(MID) as MID from T_IndustryTrade where Time = '{0}' group by Name) a inner join (select MAX(DistrictCode) as DistrictCode, Name as bName from T_BusinessDistrict group by Name) b on aName = bName order by a.TradeSum desc", startDate);
                    dt = db.GetDataTable(sql);
                    int dCode = 0;
                    foreach (DataRow dr in dt.Rows)
                    {
                        if (dr["aName"].ToString() == name)
                        {
                            dCode = Convert.ToInt32(dr["DistrictCode"]);
                        }
                    }

                    int cityRank = 0;
                    int DistrictRank = 0;
                    foreach (DataRow dr in dt.Rows)
                    {
                        cityRank++;
                        if (dCode == Convert.ToInt32(dr["DistrictCode"]))
                        {
                            DistrictRank++;
                        }
                        if (dr["aName"].ToString() == name)
                        {
                            bds.Name = name;
                            bds.CityRank = cityRank;
                            bds.DistrictRank = DistrictRank;
                            bds.MID = Convert.ToInt32(dr["MID"]);
                        }
                    }
                    bds.CityTotal = cityRank;
                    bds.DistrictTotal = DistrictRank;
                    sql = "select * from T_BusinessDistrict a left join D_BusinessDistrictClass b on a.ClassCode = b.DM where Name = '" + name + "'";
                    dt = db.GetDataTable(sql);
                    bds.Class = dt.Rows[0]["MC"].ToString();
                    foreach (DataRow dr in dt.Rows)
                    {
                        bds.Area += dr["Area"].ToString() + "/";
                    }

                    string trafficIndex = db.GetFirstValue("select Num from T_BDTrafficIndex where Name = '" + name + "'").ToString();
                    if (trafficIndex != "")
                    {
                        bds.Traffic = Convert.ToDouble(trafficIndex);
                    }
                    else
                    {
                        bds.Traffic = 0;
                    }
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(bds);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        public Result GetBDArea(string name)
        {
            Result result = new Result();
            try
            {
                
                string sql = "select * from T_BusinessDistrict a left join D_BusinessDistrictClass b on a.ClassCode = b.DM where Name = '" + name + "'";
                DataTable dt = db.GetDataTable(sql);
                string area = "";
                foreach (DataRow dr in dt.Rows)
                {
                    area += dr["Area"].ToString() + "/";
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(area);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //商圈共享客流
        public class BDShare
        {
            public string Name { get; set; }
            public double Percent { get; set; }
        }
        public Result GetBDShare(string name,string time)
        {
            Result result = new Result();
            try
            {
                ArrayList d = new ArrayList();
                if(time == "all")
                {
                    string sql = String.Format("select Avg(Sum) as Sum,TargetBD,SourceBD from T_BusinessDistrictShare where SourceBD = '{0}' group by TargetBD,SourceBD order by Sum desc", name);
                    DataTable dt = db.GetDataTable(sql);
                    double total = 0;
                    foreach (DataRow dr in dt.Rows)
                    {
                        total += Convert.ToDouble(dr["Sum"]);
                    }
                    foreach (DataRow dr in dt.Rows)
                    {
                        BDShare BDS = new BDShare();
                        BDS.Name = dr["TargetBD"].ToString();
                        BDS.Percent = (Convert.ToDouble(dr["Sum"]) / total) * 100;
                        d.Add(BDS);
                    }
                }
                else
                {
                    string t = Convert.ToDateTime(time).ToString("yyyy-MM-01 00:00:00");
                    string sql = String.Format("select * from T_BusinessDistrictShare where SourceBD = '{0}' and Time = '{1}' order by Sum desc", name, t);
                    DataTable dt = db.GetDataTable(sql);
                    sql = String.Format("select Sum(Sum) from T_BusinessDistrictShare where SourceBD = '{0}' and Time = '{1}' group by SourceBD", name, t);
                    double total = Convert.ToDouble(db.GetFirstValue(sql));
                    foreach (DataRow dr in dt.Rows)
                    {
                        BDShare BDS = new BDShare();
                        BDS.Name = dr["TargetBD"].ToString();
                        BDS.Percent = (Convert.ToDouble(dr["Sum"]) / total) * 100;
                        d.Add(BDS);
                    }
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(d);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //商圈内行业交易额
        public Result GetBDIndustry(string name, string time)
        {
            Result result = new Result();
            try
            {
                if(time == "all")
                {
                    string sql = String.Format("select Industry,Avg(TradeSum) as TradeSum from T_IndustryTrade where Name = '{0}' group by Industry order by TradeSum desc", name);
                    DataTable dt = db.GetDataTable(sql);
                    double sum = 0;
                    foreach (DataRow dr in dt.Rows)
                    {
                        sum += Convert.ToDouble(dr["TradeSum"]);
                    }
                    foreach (DataRow dr in dt.Rows)
                    {
                        dr["TradeSum"] = Convert.ToDouble(dr["TradeSum"]) / sum * 100;
                    }
                    result.result = "ok";
                    result.data = JsonConvert.SerializeObject(dt);
                }
                else
                {
                    string t = Convert.ToDateTime(time).ToString("yyyy-MM-01 00:00:00");
                    string sql = String.Format("select Industry,TradeSum from T_IndustryTrade where Name = '{0}' and Time = '{1}' order by TradeSum desc", name, t);
                    DataTable dt = db.GetDataTable(sql);
                    double sum = Convert.ToDouble(db.GetFirstValue(String.Format("select Sum(TradeSum) from T_IndustryTrade where Name = '{0}' and Time = '{1}' group by TIme", name, t)));
                    foreach (DataRow dr in dt.Rows)
                    {
                        dr["TradeSum"] = Convert.ToDouble(dr["TradeSum"]) / sum * 100;
                        result.result = "ok";
                        result.data = JsonConvert.SerializeObject(dt);
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //刷卡来源地
        public Result GetBDCardSource(string name ,string time)
        {
            Result result = new Result();
            try
            {
                if(time == "all")
                {
                    string sql = String.Format("select Source,Avg(Sum) as Sum from T_CardSource where Name = '{0}' and Source != '上海市' group by Source order by Sum Desc", name);
                    double sum = 0;
                    DataTable dt = db.GetDataTable(sql);
                    foreach (DataRow dr in dt.Rows)
                    {
                        sum += Convert.ToDouble(dr["Sum"]);
                    }
                    foreach (DataRow dr in dt.Rows)
                    {
                        dr["Sum"] = Convert.ToDouble(dr["Sum"]) / sum * 100;
                    }
                    result.result = "ok";
                    result.data = JsonConvert.SerializeObject(dt);
                } 
                else
                {
                    DateTime t = Convert.ToDateTime(time);
                    string sql = String.Format("select * from T_CardSource where Name = '{0}' and Time = '{1}' and Source != '上海市' order by Sum Desc", name, time);
                    double sum = Convert.ToDouble(db.GetFirstValue(String.Format("select top 1 Sum from T_CardSource where Name = '{0}' and Time = '{1}' and Source != '上海市' order by Sum Desc", name, time)));
                    DataTable dt = db.GetDataTable(sql);
                    foreach (DataRow dr in dt.Rows)
                    {
                        dr["Sum"] = Convert.ToDouble(dr["Sum"]) / sum * 100;
                    }
                    result.result = "ok";
                    result.data = JsonConvert.SerializeObject(dt);
                }
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //商圈客流来源地
        public Result GetBDCustomerSource(string name,string time)
        {
            Result result = new Result();
            try
            {
                if(time == "all")
                {
                    string sql = String.Format("select Name,Num,MC from (select Name,Avg(Num) as Num,DistrictCode from T_BDCustomerSource group by DistrictCode,Name) a inner join D_District b on a.DistrictCode = b.DM where Name = '{0}'", name);
                    double sum = 0;
                    DataTable dt = db.GetDataTable(sql);
                    foreach (DataRow dr in dt.Rows)
                    {
                        sum += Convert.ToDouble(dr["Num"]);
                    }
                    foreach (DataRow dr in dt.Rows)
                    {
                        dr["Num"] = Convert.ToDouble(dr["Num"]) / sum * 100;
                    }
                    result.result = "ok";
                    result.data = JsonConvert.SerializeObject(dt);
                }
                else
                {
                    string sql = String.Format("select Name,Num,MC from T_BDCustomerSource a inner join D_District b on a.DistrictCode = b.DM where Name = '{0}' and Time = '{1}'", name, time);
                    double sum = Convert.ToDouble(db.GetFirstValue(String.Format("select Sum(Num) as Num from T_BDCustomerSource where Name = '{0}' and Time = '{1}'", name, time)));
                    DataTable dt = db.GetDataTable(sql);
                    foreach (DataRow dr in dt.Rows)
                    {
                        dr["Num"] = Convert.ToDouble(dr["Num"]) / sum * 100;
                    }
                    result.result = "ok";
                    result.data = JsonConvert.SerializeObject(dt);
                }
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //商圈客流标签
        public Result GetCustomerPropertyData(string name,string time)
        {
            Result result = new Result();
            try
            {
                if(time == "all")
                {
                    string sql = String.Format("select Property,Threshold,Avg([Percent]) as [Percent] from T_CustomerProperty where Name = '{0}' group by Property,Threshold", name);
                    DataTable dt = db.GetDataTable(sql);
                    result.result = "ok";
                    result.data = JsonConvert.SerializeObject(dt);
                }
                else
                {
                    string t = Convert.ToDateTime(time).ToString("yyyy-MM-01 00:00:00");
                    string sql = String.Format("select * from T_CustomerProperty where Name = '{0}' and Time = '{1}' ", name, time);
                    DataTable dt = db.GetDataTable(sql);
                    result.result = "ok";
                    result.data = JsonConvert.SerializeObject(dt);
                }
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        //商圈销售额比较
        public Result GetBDConsumption(string name1,string name2)
        {
            Result result = new Result();
            try
            {
                string sql = string.Format("select Name,SUM(TradeSum) as TradeSum,(SUM(TradeSum)/SUM(TradeTime)) as TradeAverage from T_IndustryTrade where (Name = '{0}' or Name = '{1}') group by Name", name1, name2);
                DataTable xse = db.GetDataTable(sql);
                double max = Convert.ToDouble(db.GetFirstValue(string.Format("select Max(TradeSum) from (select Name,SUM(TradeSum) as TradeSum,AVG(TradeAverage) as TradeAverage from T_IndustryTrade where  (Name = '{0}' or Name = '{1}') group by Name) a", name1, name2)));
                foreach (DataRow dr in xse.Rows)
                {
                    dr["TradeSum"] = Convert.ToDouble(dr["TradeSum"]) / max * 100;
                }
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(xse);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        public DataSet GetPOIData(string district)
        {
            try
            {
                string sql = "";
                if(district != "")
                {
                    sql = "select a.Name,a.Address,a.Area,a.Longitude,a.Latitude,b.MC as Category,c.MC as District from T_POI a left join D_POICategory b on a.Category = b.DM left join D_District c on a.DistrictCode = c.DM where c.MC = '" + district + "';select * from T_POITraffic a left join D_District b on a.DistrictCode = b.DM where b.MC = '" + district + "'";
                }
                else
                {
                    sql = "select a.Name,a.Address,a.Area,a.Longitude,a.Latitude,b.MC as Category,c.MC as District from T_POI a left join D_POICategory b on a.Category = b.DM left join D_District c on a.DistrictCode = c.DM;select * from T_POITraffic";
                }
                DataSet ds = db.GetDataset(sql);
                return ds;
            }
            catch (Exception ex)
            {
                DataSet ds = new DataSet();
                DataTable dt = new DataTable();
                dt.Columns.Add("error");
                DataRow dr = dt.NewRow();
                dr[0] = ex.Message + "||" + ex.StackTrace;
                dt.Rows.Add(dr);
                ds.Tables.Add(dt);
                return ds;
            }
        }

        public class HourFlow
        {
            public string Time { get; set; }
            public double Flow { get; set; }
        }
        public class POIStatistic
        {
            public string Name { get; set; }
            public int Num { get; set; }
        }
        public ArrayList GetCustomerFlowDataByCircleTime(string center,string radius,string time, string district)
        {
            try
            {
                ArrayList result = new ArrayList();
                ArrayList resultFlow = new ArrayList();
                ArrayList resultPOI = new ArrayList();


                DateTime datetime = Convert.ToDateTime(time).AddHours(0);
                string st = Convert.ToDateTime(time).ToString("yyyy-MM-dd 00:00:00");
                string et = Convert.ToDateTime(time).ToString("yyyy-MM-dd 23:00:00");
                string sql = String.Format("select * from T_CustomerFlow where  Time >= '{0}' and Time <='{1}'", st, et);
                DataTable dt = db.GetDataTable(sql);
                for(int i = 0; i < 24; i++)
                {
                    HourFlow hf = new HourFlow();
                    hf.Time = datetime.AddHours(i).ToString("yyyy-MM-dd HH:00:00");
                    resultFlow.Add(hf);
                }
                double MLonA = Convert.ToDouble(center.Split(',')[0]);
                double MLatA = Convert.ToDouble(center.Split(',')[1]);
                double R = 6371008.8;
                double FlowSum = 0;
                foreach (DataRow dr in dt.Rows)
                {
                    double MLonB = Convert.ToDouble(dr["Lon"]);
                    double MLatB = Convert.ToDouble(dr["Lat"]);
                    double radLat1 = Rad(MLatA);
                    double radLng1 = Rad(MLonA);
                    double radLat2 = Rad(MLatB);
                    double radLng2 = Rad(MLonB);
                    double a = radLat1 - radLat2;
                    double b = radLng1 - radLng2;
                    double Distance = 2 * Math.Asin(Math.Sqrt(Math.Pow(Math.Sin(a / 2), 2) + Math.Cos(radLat1) * Math.Cos(radLat2) * Math.Pow(Math.Sin(b / 2), 2))) * 6378137;
                    if (Distance < Convert.ToDouble(radius))
                    {
                        foreach(HourFlow hf in resultFlow)
                        {
                            if(Convert.ToDateTime(hf.Time) == Convert.ToDateTime(dr["Time"]))
                            {
                                hf.Flow += Convert.ToDouble(dr["Sum"]);
                                FlowSum += Convert.ToDouble(dr["Sum"]);
                            }
                        }
                    }
                }

                result.Add(resultFlow);

                dt = db.GetDataTable("select * from D_POICategory");
                foreach(DataRow dr in dt.Rows)
                {
                    POIStatistic pois = new POIStatistic();
                    pois.Name = dr["MC"].ToString();
                    pois.Num = 0;
                    resultPOI.Add(pois);
                }
                POIStatistic poisDT = new POIStatistic();
                poisDT.Name = "地铁站";
                poisDT.Num = 0;
                resultPOI.Add(poisDT);
                POIStatistic poisGJ = new POIStatistic();
                poisGJ.Name = "公交站";
                poisGJ.Num = 0;
                resultPOI.Add(poisGJ);

                if(district != "")
                {
                    dt = db.GetDataTable("select * from T_POI a left join D_POICategory b on a.Category = b.DM left join D_District c on a.DistrictCode = c.DM where c.MC = '" + district + "'");
                }
                else
                {
                    dt = db.GetDataTable("select * from T_POI a left join D_POICategory b on a.Category = b.DM");
                }
                foreach (DataRow dr in dt.Rows)
                {
                    double MLonB = Convert.ToDouble(dr["Longitude"]);
                    double MLatB = Convert.ToDouble(dr["Latitude"]);
                    double radLat1 = Rad(MLatA);
                    double radLng1 = Rad(MLonA);
                    double radLat2 = Rad(MLatB);
                    double radLng2 = Rad(MLonB);
                    double a = radLat1 - radLat2;
                    double b = radLng1 - radLng2;
                    double Distance = 2 * Math.Asin(Math.Sqrt(Math.Pow(Math.Sin(a / 2), 2) + Math.Cos(radLat1) * Math.Cos(radLat2) * Math.Pow(Math.Sin(b / 2), 2))) * 6378137;
                    if (Distance < Convert.ToDouble(radius))
                    {
                        foreach (POIStatistic pois in resultPOI)
                        {
                            if (pois.Name == dr["MC"].ToString())
                            {
                                pois.Num += 1;
                            }
                        }
                    }
                }
                if (district != "")
                {
                    dt = db.GetDataTable("select * from T_POITraffic a left join D_District c on a.DistrictCode = c.DM where c.MC = '" + district + "'");
                }
                else
                {
                    dt = db.GetDataTable("select * from T_POITraffic");
                }
                string aa = "";
                foreach (DataRow dr in dt.Rows)
                {
                    double MLonB = Convert.ToDouble(dr["Longitude"]);
                    double MLatB = Convert.ToDouble(dr["Latitude"]);
                    double radLat1 = Rad(MLatA);
                    double radLng1 = Rad(MLonA);
                    double radLat2 = Rad(MLatB);
                    double radLng2 = Rad(MLonB);
                    double a = radLat1 - radLat2;
                    double b = radLng1 - radLng2;
                    double Distance = 2 * Math.Asin(Math.Sqrt(Math.Pow(Math.Sin(a / 2), 2) + Math.Cos(radLat1) * Math.Cos(radLat2) * Math.Pow(Math.Sin(b / 2), 2))) * 6378137;
                    if (Distance < Convert.ToDouble(radius))
                    {
                        foreach (POIStatistic pois in resultPOI)
                        {
                            if (pois.Name == (dr["Category"].ToString() + "站"))
                            {
                                if (dr["Category"].ToString() == "地铁")
                                {
                                    aa += "'" + dr["Name"].ToString() + "',";
                                }
                                pois.Num += 1;
                            }
                        }
                    }
                }

                result.Add(resultPOI);

                return result;
            }
            catch (Exception ex)
            {
                ArrayList result = new ArrayList();
                string error = ex.Message + "||" + ex.StackTrace;
                result.Add(error);
                return result;
            }
        }
        private static double Rad(double d)
        {
            return (double)d * Math.PI / 180d;
        }

        public ArrayList GetCustomerFlowDataByPolygonTime(string ptsString, string time, string district)
        {
            try
            {

                AnalyzeExcelImpl ael = new AnalyzeExcelImpl();

                ArrayList result = new ArrayList();
                ArrayList resultFlow = new ArrayList();
                ArrayList resultPOI = new ArrayList();

                var pts = ptsString.Split(';');

                AnalyzeExcelImpl.PointF[] pointFs = new AnalyzeExcelImpl.PointF[pts.Length - 1];
                for(int i = 0;i<pts.Length - 1; i++)
                {
                    AnalyzeExcelImpl.PointF pf = new AnalyzeExcelImpl.PointF();
                    pf.X = Convert.ToDouble(pts[i].Split(',')[0]);
                    pf.Y = Convert.ToDouble(pts[i].Split(',')[1]);
                    pointFs[i] = pf;
                }


                DateTime datetime = Convert.ToDateTime(time).AddHours(0);
                string st = Convert.ToDateTime(time).ToString("yyyy-MM-dd 00:00:00");
                string et = Convert.ToDateTime(time).ToString("yyyy-MM-dd 23:00:00");
                string sql = String.Format("select * from T_CustomerFlow where  Time >= '{0}' and Time <='{1}'", st, et);
                DataTable dt = db.GetDataTable(sql);
                for (int i = 0; i < 24; i++)
                {
                    HourFlow hf = new HourFlow();
                    hf.Time = datetime.AddHours(i).ToString("yyyy-MM-dd HH:00:00");
                    resultFlow.Add(hf);
                }
                
                double FlowSum = 0;
                foreach (DataRow dr in dt.Rows)
                {
                    AnalyzeExcelImpl.PointF checkPoint = new AnalyzeExcelImpl.PointF();
                    checkPoint.X = Convert.ToDouble(dr["Lon"]);
                    checkPoint.Y = Convert.ToDouble(dr["Lat"]);
                    bool inOut = ael.rayCasting(checkPoint, pointFs);
                    if (inOut)
                    {
                        foreach (HourFlow hf in resultFlow)
                        {
                            if (Convert.ToDateTime(hf.Time) == Convert.ToDateTime(dr["Time"]))
                            {
                                hf.Flow += Convert.ToDouble(dr["Sum"]);
                                FlowSum += Convert.ToDouble(dr["Sum"]);
                            }
                        }
                    }
                }

                result.Add(resultFlow);

                dt = db.GetDataTable("select * from D_POICategory");
                foreach (DataRow dr in dt.Rows)
                {
                    POIStatistic pois = new POIStatistic();
                    pois.Name = dr["MC"].ToString();
                    pois.Num = 0;
                    resultPOI.Add(pois);
                }
                POIStatistic poisDT = new POIStatistic();
                poisDT.Name = "地铁站";
                poisDT.Num = 0;
                resultPOI.Add(poisDT);
                POIStatistic poisGJ = new POIStatistic();
                poisGJ.Name = "公交站";
                poisGJ.Num = 0;
                resultPOI.Add(poisGJ);

                if (district != "")
                {
                    dt = db.GetDataTable("select * from T_POI a left join D_POICategory b on a.Category = b.DM left join D_District c on a.DistrictCode = c.DM where c.MC = '" + district + "'");
                }
                else
                {
                    dt = db.GetDataTable("select * from T_POI a left join D_POICategory b on a.Category = b.DM");
                }
                foreach (DataRow dr in dt.Rows)
                {
                    AnalyzeExcelImpl.PointF checkPoint = new AnalyzeExcelImpl.PointF();
                    checkPoint.X = Convert.ToDouble(dr["Longitude"]);
                    checkPoint.Y = Convert.ToDouble(dr["Latitude"]);
                    bool inOut = ael.rayCasting(checkPoint, pointFs);
                    if (inOut)
                    {
                        foreach (POIStatistic pois in resultPOI)
                        {
                            if (pois.Name == dr["MC"].ToString())
                            {
                                pois.Num += 1;
                            }
                        }
                    }
                }
                if (district != "")
                {
                    dt = db.GetDataTable("select * from T_POITraffic a left join D_District c on a.DistrictCode = c.DM where c.MC = '" + district + "'");
                }
                else
                {
                    dt = db.GetDataTable("select * from T_POITraffic");
                }
                string aa = "";
                foreach (DataRow dr in dt.Rows)
                {
                    AnalyzeExcelImpl.PointF checkPoint = new AnalyzeExcelImpl.PointF();
                    checkPoint.X = Convert.ToDouble(dr["Longitude"]);
                    checkPoint.Y = Convert.ToDouble(dr["Latitude"]);
                    bool inOut = ael.rayCasting(checkPoint, pointFs);
                    if (inOut)
                    {
                        foreach (POIStatistic pois in resultPOI)
                        {
                            if (pois.Name == (dr["Category"].ToString() + "站"))
                            {
                                if (dr["Category"].ToString() == "地铁")
                                {
                                    aa += "'" + dr["Name"].ToString() + "',";
                                }
                                pois.Num += 1;
                            }
                        }
                    }
                }

                result.Add(resultPOI);

                return result;
            }
            catch (Exception ex)
            {
                ArrayList result = new ArrayList();
                string error = ex.Message + "||" + ex.StackTrace;
                result.Add(error);
                return result;
            }
        }

        public string GetDataLastestTime(string type)
        {
            try
            {
                string result = "";
                if(type == "sh")
                {
                    result =  db.GetFirstValue("select top 1 Time from T_DistrictConsumption order by Time desc").ToString();
                }
                else if (type == "district")
                {
                    result = db.GetFirstValue("select top 1 Time from T_IndustryTrade order by Time desc").ToString();
                }
                else if (type == "bd")
                {

                }
                return result;
            }
            catch(Exception ex)
            {
                return ex.Message + "||" + ex.StackTrace;
            }
        }

        public DataSet GetBlockNDistrict()
        {
            try
            {
                DataSet ds = new DataSet();
                DataTable dt = db.GetDataTable("select MC from D_District order by MC");
                dt.TableName = "district";
                DataTable dt2 = db.GetDataTable("select a.MC as Block,b.MC as District from D_Block a left join D_District b on a.DistrictCode = b.DM");
                dt2.TableName = "block";
                ds.Tables.Add(dt);
                ds.Tables.Add(dt2);
                return ds;
            }
            catch (Exception ex)
            {
                DataSet ds = new DataSet();
                DataTable dt = new DataTable();
                dt.Columns.Add("error");
                DataRow dr = dt.NewRow();
                dr[0] = ex.Message + "||" + ex.StackTrace;
                dt.Rows.Add(dr);
                ds.Tables.Add(dt);
                return ds;
            }
        }

        public string UploadFile(string filename, string streamLength, Stream streamInput)
        {
            string reuslt = "true";

            int byLength = Convert.ToInt32(streamLength);
            byte[] resultByte = new byte[byLength];
            string now = DateTime.Now.ToString("yyyyMMdd");
            string folder = @"D:\publish\web\data\uploadFile\" + now + @"\";
            string excelFile = folder + filename;

            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }

            if (File.Exists(excelFile))
            {
                File.Delete(excelFile);
            }

            streamInput.Read(resultByte, 0, resultByte.Length);
            FileStream fs = new FileStream(excelFile, FileMode.Create);
            fs.Write(resultByte, 0, resultByte.Length);
            fs.Close();

            return reuslt;
        }

        public DataSet ReadExcelAsDataSet(string filePath)
        {
            using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
            {
                using (var reader = ExcelReaderFactory.CreateReader(stream))
                {
                    DataSet data = reader.AsDataSet();
                    return data;
                }
            }
        }

        public string checkUploadFile(string fileName,string table)
        {
            try
            {
                string result = "";

                DataTable dt = db.GetDataTable("select * from T_TableInfo where Name = '" + table + "'");
                int FieldCount = Convert.ToInt32(dt.Rows[0]["FieldCount"]);
                int TimeCount = Convert.ToInt32(dt.Rows[0]["TimeField"]);

                string now = DateTime.Now.ToString("yyyyMMdd");
                string folder = @"D:\publish\web\data\uploadFile\" + now + @"\" + fileName;

                DataSet Excel = ReadExcelAsDataSet(folder);
                DataTable Data = Excel.Tables[0];
                if (FieldCount != Data.Columns.Count)
                {
                    result = "字段数量不匹配！应为：" + FieldCount + "；实际为：" + Data.Columns.Count;
                }
                else
                {
                    for (int i = 1; i < Data.Rows.Count; i++)
                    {
                        DataRow dr = Data.Rows[i];
                        try
                        {
                            for (int t = 0; t < TimeCount; t++)
                            {
                                DateTime dateTime = Convert.ToDateTime(dr[t]);
                            }
                        }
                        catch
                        {
                            result += "时间格式错误！第" + (i + 1) + "行；\r\n";
                        }
                    }
                }

                return result;
            }
            catch(Exception ex)
            {
                return ex.Message;
            }
        }

        public Result GetBDRankTop(double min, string time)
        {
            Result result = new Result();
            try
            {
                ArrayList bdlist = new ArrayList();
                DateTime t = Convert.ToDateTime(time);
                string startDate = t.ToString("yyyy-MM-01");
                string endDate = t.AddMonths(1).ToString("yyyy-MM-01");
                DataTable dt;

                DataTable bd = db.GetDataTable("select DISTINCT name from T_businessDistrict");

                string sql = string.Format("select aName,a.TradeSum,a.MID,b.DistrictCode from (select Max(Name) as aName,SUM(TradeSum) as TradeSum,Sum(MID) as MID from T_IndustryTrade where Time = '{0}' group by Name) a inner join (select MAX(DistrictCode) as DistrictCode, Name as bName from T_BusinessDistrict group by Name) b on aName = bName order by a.TradeSum desc", startDate);
                dt = db.GetDataTable(sql);
                foreach(DataRow bdr in bd.Rows)
                {
                    string name = bdr["name"].ToString();
                    int dCode = 0;
                    foreach (DataRow dr in dt.Rows)
                    {
                        if (dr["aName"].ToString() == name)
                        {
                            dCode = Convert.ToInt32(dr["DistrictCode"]);
                        }
                    }

                    int cityRank = 0;
                    int DistrictRank = 0;
                    int BDDistrictRank = 0;
                    foreach (DataRow dr in dt.Rows)
                    {
                        cityRank++;
                        if (dCode == Convert.ToInt32(dr["DistrictCode"]))
                        {
                            DistrictRank++;
                        }
                        if (dr["aName"].ToString() == name)
                        {
                            BDDistrictRank = DistrictRank;
                        }
                    }
                    if(BDDistrictRank <= min)
                    {
                        bdlist.Add(name);
                    }
                }

                result.result = "ok";
                result.data = JsonConvert.SerializeObject(bdlist);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        public Result Login(string username, string password)
        {
            Result result = new Result();
            try
            {
                string count = db.GetFirstValue("select count(*) from T_User where Username = '" + username + "'");
                if(count == "1")
                {
                    count = db.GetFirstValue("select count(*) from T_User where Username = '" + username + "' and Password = '" + password + "'");
                    if (count == "1")
                    {
                        result.result = "ok";
                        result.data = JsonConvert.SerializeObject(db.GetDataTable("select * from T_User where Username = '" + username + "' and Password = '" + password + "'"));
                        return result;
                    }
                    else
                    {
                        result.result = "fail";
                        result.data = "密码错误！";
                        return result;
                    }
                }
                else
                {
                    result.result = "fail";
                    result.data = "用户名错误！";
                    return result;
                }
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        public Result GetDistinctTime(string type,string data,string para)
        {
            Result result = new Result();
            string format = type == "year" ? "yyyy" : "MM";
            string table = "";
            if(data == "城市间")
            {
                table = "T_NonLocalConsumption";
            }
            else
            {
                table = "T_NonLocalConsumption";
            }
            try
            {
                string sql = "";
                if(type == "year")
                {
                    sql = string.Format("select distinct(DATENAME({0},Time)) as Time from {1} order by Time desc", format, table);
                }
                else
                {
                    sql = string.Format("select distinct(DATENAME({0},Time)) as Time from {1} where DATENAME(yyyy,Time) = {2} order by Time desc", format, table, para);
                }
                DataTable dt = db.GetDataTable(sql);
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(dt);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        public Result GetUploadLog(string st, string et)
        {
            Result result = new Result();
            try
            {
                DataTable dt = db.GetDataTable("select * from T_UPLOADLOG where Time >= '" + st + "' and Time <= '" + et + "'");
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(dt);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        public Result GetUser()
        {
            Result result = new Result();
            try
            {
                string sql = "select id,username,role,roledetail,'删除' as deleteUser from T_User" ;
                DataTable table = db.GetDataTable(sql);
                result.result = "ok";
                result.data = JsonConvert.SerializeObject(table);
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        public Result DeleteUser(string id,string name)
        {
            Result result = new Result();
            try
            {
                string sql = "delete from T_User where id = " + id + " and Username = '" + name + "'";
                db.Execute(sql);
                result.result = "ok";
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }

        public Result AddUser(string name,string password,string role,string detail)
        {
            Result result = new Result();
            try
            {
                string sql = "insert into T_User VALUES ('" + name + "', '" + password + "','" + role + "','" + detail + "')";
                db.Execute(sql);
                result.result = "ok";
                return result;
            }
            catch (Exception ex)
            {
                result.result = "fail";
                result.data = ex.Message + "||" + ex.StackTrace;
                return result;
            }
        }
    }
};
