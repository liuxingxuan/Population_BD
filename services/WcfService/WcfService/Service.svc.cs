using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Text;
using System.Collections;
using System.IO;

using Newtonsoft.Json;
using Readearth.Data;
using WcfService.ServiceImpl;

namespace WcfService
{
    [ServiceContract]
    public interface IService
    {
        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "Test"
        )]
        string Test();

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetYDXFData?time={time}"
        )]
        string GetYDXFData(string time);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetYDXFPieData?Time={Time}&City={City}&Type={Type}"
        )]
        string GetYDXFPieData(string Time, string City, string Type);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetQXSSEData?time={time}&name={name}"
        )]
        string GetQXSSEData(string time,string name);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetDistrictChartsData?time={time}&name={name}"
        )]
        string GetDistrictChartsData(string time, string name);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetPOIData?district={district}"
        )]
        string GetPOIData(string district);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetCustomerFlowDataByCircleTime?center={center}&radius={radius}&time={time}&district={district}"
        )]
        string GetCustomerFlowDataByCircleTime(string center, string radius, string time,string district);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetCustomerFlowDataByPolygonTime?ptsString={ptsString}&time={time}&district={district}"
        )]
        string GetCustomerFlowDataByPolygonTime(string ptsString, string time, string district);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetBDChartsData?name={name}&time={time}"
        )]
        string GetBDChartsData(string name, string time);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetShanghaiStatisticData?time={time}"
        )]
        string GetShanghaiStatisticData(string time);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetBDCompareData?name1={name1}&name2={name2}"
        )]
        string GetBDCompareData(string name1, string name2);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetDataLastestTime?type={type}"
        )]
        string GetDataLastestTime(string type);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetDistrictBD?name={name}"
        )]
        string GetDistrictBD(string name);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetBlockNDistrict"
        )]
        string GetBlockNDistrict();

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetDistrictDataTime"
        )]
        string GetDistrictDataTime();

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetSHSQData?district={district}"
        )]
        string GetSHSQData(string district);

        [OperationContract]
        [WebInvoke(Method = "POST",
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "uploadfile?filename={filename}&streamLength={streamLength}"
        )]
        string uploadfile(string filename, string streamLength, Stream streamInput);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "checkUploadFile?fileName={fileName}&table={table}"
        )]
        string checkUploadFile(string fileName, string table);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "analyzeFile?fileName={fileName}&type={type}&user={user}"
        )]
        string analyzeFile(string fileName ,string type,string user);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetBDRankTop?min={min}&time={time}"
        )]
        string GetBDRankTop(double min, string time);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "Login?username={username}&password={password}"
        )]
        string Login(string username, string password);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetDistinctTime?type={type}&data={data}&para={para}"
        )]
        string GetDistinctTime(string type, string data,string para);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetUploadLog?st={st}&et={et}"
        )]
        string GetUploadLog(string st, string et);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetUser"
        )]
        string GetUser();

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "DeleteUser?id={id}&user={user}"
        )]
        string DeleteUser(string id, string user);

        [OperationContract]
        [WebInvoke(Method = "GET",
            RequestFormat = WebMessageFormat.Json,
            ResponseFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "AddUser?name={name}&password={password}&role={role}&detail={detail}"
        )]
        string AddUser(string name, string password,string role,string detail);
    }

    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
    public class Service : IService
    {
        ServiceImpl.ServiceImpl SI = new ServiceImpl.ServiceImpl();
        ServiceImpl.AnalyzeExcelImpl AEI = new ServiceImpl.AnalyzeExcelImpl();
        public string Test()
        {
            //return JsonConvert.SerializeObject(GetSHSQData());
            //return "ok";
            string result = "";
            //AEI.AnalyzeBlockJson(@"D:\publish\web\data\uploadFile\20190611\上海街道区划_GCJ02.json");
            //result += JsonConvert.SerializeObject(AEI.AnalyzeGQJTBLata(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\各区交通便利指数排名.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzeSHSQData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\上海商圈.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzeQXXSEData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\区县销售额.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzeSQHYHXBJData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\商圈行业每月横向比较统计.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzeSKLYDData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\商圈刷卡地来源地统计top10.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzeXFRQBQData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\商圈消费人群标签统计.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzeGXKLData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\商圈共享客流统计.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzeSQKLData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\商圈人流.xlsx"));
            ////result += JsonConvert.SerializeObject(AEI.AnalyzePOIData(@"E:\复旦商圈项目\design\一期数据\0516\更新数据\二期更新数据\便民设施POI.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzePOITrafficData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\地铁公交线.xlsx"));
            ////result += JsonConvert.SerializeObject(AEI.AnalyzeDistrictPopulationData(@"E:\复旦商圈项目\design\一期数据\0516\更新数据\二期更新数据\各区人口统计.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzeSQZBRKData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\商圈周边人口.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzeSQKLLYDData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\商圈人流来源地.xlsx"));
            //result += JsonConvert.SerializeObject(AEI.AnalyzeSQJTZSDData(@"E:\复旦商圈项目\design\一期数据\0603\商圈模板数据6-3更新\商圈交通便利度.xlsx"));

            //result += JsonConvert.SerializeObject(SI.checkUploadFile("", ""));

            return result;

            //return SI.Test();
            //return AEI.AnalyzeBlockJson("");
            //return JsonConvert.SerializeObject(AEI.AnalyzeCustomerFlowData("")); 

            //return JsonConvert.SerializeObject(AEI.AnalyzeYDXFData(""));
            //return JsonConvert.SerializeObject(SI.GetSHSQData());







            //return JsonConvert.SerializeObject(SI.GetCustomerPropertyData("徐家汇商圈","2018-01-12"));
            //return JsonConvert.SerializeObject(SI.GetYDXFData("2018-01-01"));
            //return JsonConvert.SerializeObject(SI.GetSKLYDTop5("徐家汇商圈", "2018-01-12"));
            //return JsonConvert.SerializeObject(SI.GetSQGHYStatistics("徐家汇商圈", "2018-01-12"));
            //return JsonConvert.SerializeObject(SI.GetBDShareStatistics("徐家汇商圈", "2018-01-12"));
            //return JsonConvert.SerializeObject(SI.GetBDStatistics("徐家汇商圈", "2018-01-12"));
            //return JsonConvert.SerializeObject(SI.GetDistrictStatistic("徐汇区","2018-01-12"));
            //return JsonConvert.SerializeObject(SI.GetQXSSEData("2018-08-01")); 
            //return JsonConvert.SerializeObject(SI.GetCustomerFlowDataByCircleTime("121.4169344982062,31.185879021050834", "2191.0016524419448", "2019-03-11"));
        }

        public string GetSHSQData(string district)
        {
            return JsonConvert.SerializeObject(SI.GetSHSQData(district));
        }
  
        public string GetBDChartsData(string name,string time)
        {
            ArrayList result = new ArrayList();
            result.Add(SI.GetBDInfo(name, time));
            result.Add(SI.GetBDShare(name, time));
            result.Add(SI.GetBDIndustry(name, time));
            result.Add(SI.GetBDCardSource(name, time));
            result.Add(SI.GetBDCustomerSource(name, time));
            result.Add(SI.GetCustomerPropertyData(name, time));
            result.Add(SI.GetBDArea(name));
            return JsonConvert.SerializeObject(result);
        }

        public string GetQXSSEData(string time,string name)
        {
            return JsonConvert.SerializeObject(SI.GetQXSSEData(time,name));
        }

        public string GetShanghaiStatisticData(string time)
        {
            ArrayList result = new ArrayList();
            result.Add(SI.GetSHConsumption( time));
            result.Add(SI.GetSHFlow(time));
            result.Add(SI.GetSHZHL( time));
            result.Add(SI.GetSHIndustry( time));
            result.Add(SI.GetSHPopulation());
            result.Add(SI.GetSHTrafficIndex());
            return JsonConvert.SerializeObject(result);
        }

        public string GetDistrictChartsData(string time, string name)
        {
            ArrayList a = new ArrayList();
            a.Add(SI.GetDistrictConsumption(name, time));
            a.Add(SI.GetDistrictFlow(name, time));
            a.Add(SI.GetDistrictZHL(name, time));
            a.Add(SI.GetDistricIndustry(name, time));
            a.Add(SI.GetDistrictBDPopulation(name, time));
            a.Add(SI.GetDistrictBDTrafficIndex(name));
            return JsonConvert.SerializeObject(a);
        }

        public string GetYDXFData(string time)
        {
            return JsonConvert.SerializeObject(SI.GetYDXFData(time));
        }

        public string GetYDXFPieData(string Time, string City, string Type)
        {
            return JsonConvert.SerializeObject(SI.GetYDXFPieData("2018-01-01",City,Type));
        }

        public string GetPOIData(string district)
        {
            return JsonConvert.SerializeObject(SI.GetPOIData(district));
        }

        public string GetCustomerFlowDataByCircleTime(string center,string radius,string time, string district)
        {
            return JsonConvert.SerializeObject(SI.GetCustomerFlowDataByCircleTime(center,radius,time, district));
        }

        public string GetCustomerFlowDataByPolygonTime(string ptsString, string time, string district)
        {
            return JsonConvert.SerializeObject(SI.GetCustomerFlowDataByPolygonTime(ptsString, time, district));
        }

        public string GetBDCompareData(string name1,string name2)
        {
            ArrayList a = new ArrayList();
            a.Add(SI.GetBDConsumption(name1, name2));
            a.Add(GetBDChartsData(name1, "all"));
            a.Add(GetBDChartsData(name2, "all"));
            return JsonConvert.SerializeObject(a);
        }

        public string GetDataLastestTime(string type)
        {
            return SI.GetDataLastestTime(type);
        }

        public string GetDistrictBD(string name)
        {
            return JsonConvert.SerializeObject(SI.GetDistrictBD(name));
        }

        public string GetBlockNDistrict()
        {
            return JsonConvert.SerializeObject(SI.GetBlockNDistrict());
        }

        public string GetDistrictDataTime()
        {
            return JsonConvert.SerializeObject(SI.GetDistrictDataTime());
        }

        public string uploadfile(string filename,string streamLength,Stream streamInput)
        {
            return JsonConvert.SerializeObject(SI.UploadFile(filename, streamLength, streamInput));
        }

        public string checkUploadFile(string fileName, string table)
        {
            return JsonConvert.SerializeObject(SI.checkUploadFile(fileName, table));
        }

        public string GetBDRankTop(double min, string time)
        {
            return JsonConvert.SerializeObject(SI.GetBDRankTop(min, time));
        }

        public string Login(string username, string password)
        {
            return JsonConvert.SerializeObject(SI.Login(username, password));
        }

        public string GetDistinctTime(string type, string data, string para)
        {
            return JsonConvert.SerializeObject(SI.GetDistinctTime(type, data, para));
        }

        public string GetUploadLog(string st,string et)
        {
            return JsonConvert.SerializeObject(SI.GetUploadLog(st, et)); 
        }

        public string GetUser()
        {
            return JsonConvert.SerializeObject(SI.GetUser());
        }

        public string DeleteUser(string id, string user)
        {
            return JsonConvert.SerializeObject(SI.DeleteUser(id, user));
        }

        public string AddUser(string name, string password, string role, string detail)
        {
            return JsonConvert.SerializeObject(SI.AddUser(name, password, role, detail));
        }
        //TODO 修改method
     

        public string analyzeFile(string fileName,string type,string user)
        {
            try
            {
                string result = "fail";
                string now = DateTime.Now.ToString("yyyyMMdd");
                string folder = @"D:\publish\web\data\uploadFile\" + now + @"\" + fileName;
                if (fileName == "便民设施POI.xlsx")
                {
                    result = AEI.AnalyzePOIData(folder, type);
                }
                else if (fileName == "商圈行业每月横向比较统计.xlsx")
                {
                    result = AEI.AnalyzeSQHYHXBJData(folder, type);
                }
                else if (fileName == "商圈交通便利度.xlsx")
                {
                    result = AEI.AnalyzeSQJTZSDData(folder, type);
                }
                else if (fileName == "上海商圈.xlsx")
                {
                    result = AEI.AnalyzeSHSQData(folder, type);
                }
                else if (fileName == "上海街道区划_GCJ02.json")
                {
                    result = AEI.AnalyzeBlockJson(folder);
                }
                else if (fileName == "地铁公交线.xlsx")
                {
                    result = AEI.AnalyzePOITrafficData(folder,type);
                }
                else if (fileName == "商圈人流来源地.xlsx")
                {
                    result = AEI.AnalyzeSQKLLYDData(folder,type);
                }
                else if (fileName == "商圈人流.xlsx")
                {
                    result = AEI.AnalyzeSQKLData(folder,type);
                }
                else if (fileName == "上海消费输入.xlsx")
                {
                    result = AEI.AnalyzeYDXFDSRata(folder,type);
                }
                else if (fileName == "上海消费输出.xlsx")
                {
                    result = AEI.AnalyzeYDXFDSCata(folder,type);
                }
                else if (fileName == "各区人口统计.xlsx")
                {
                    result = AEI.AnalyzeDistrictPopulationData(folder, type);
                }
                else if (fileName == "商圈共享客流统计.xlsx")
                {
                    result = AEI.AnalyzeGXKLData(folder, type);
                }
                else if (fileName == "商圈消费人群标签统计.xlsx")
                {
                    result = AEI.AnalyzeXFRQBQData(folder, type);
                }
                else if (fileName == "商圈刷卡地来源地统计top10.xlsx")
                {
                    result = AEI.AnalyzeSKLYDData(folder, type);
                }
                else if (fileName == "区县销售额.xlsx")
                {
                    result = AEI.AnalyzeQXXSEData(folder, type);
                }
                else if (fileName == "各区交通便利指数排名.xlsx")
                {
                    result = AEI.AnalyzeGQJTBLata(folder, type);
                }
                else if (fileName == "商圈周边人口.xlsx")
                {
                    result = AEI.AnalyzeSQZBRKData(folder, type);
                }
                else if (fileName == "小时人流.xlsx")
                {
                    result = AEI.AnalyzeCustomerFlowData(folder, type);
                }

                Database db = new Database();
                string rSql = "";
                if (result == "ok")
                {
                    rSql = String.Format("insert into T_UploadLog values('{0}','{1}','{2}','{3}','{4}','{5}')", DateTime.Now, fileName, user, type, result, "");
                    result = "入库成功！";
                }
                else
                {
                    rSql = String.Format("insert into T_UploadLog values('{0}','{1}','{2}','{3}','{4}','{5}')", DateTime.Now, fileName, user, type, "fail", result);
                }
                db.Execute(rSql);

                return result;
            }
            catch(Exception ex)
            {
                return ex.Message + "||" + ex.StackTrace;
            }
        }
    }
}
