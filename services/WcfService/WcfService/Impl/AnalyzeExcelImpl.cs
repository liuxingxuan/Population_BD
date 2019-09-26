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

using DotSpatial.Projections;

namespace WcfService.ServiceImpl
{
    public class AnalyzeExcelImpl
    {
        Database db = new Database();

        public DataSet ReadExcelAsDatatable(string filePath)
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

        //上海街道区划json数据解析入库
        public string AnalyzeBlockJson(string filePath)
        {
            string result = "ok";
            try
            {

                DataTable districtTable = db.GetDataTable("select * from D_District");

                DataTable blockTable = db.GetDataTable("select top 0 * from D_Block");

                StreamReader sr = new StreamReader(filePath, Encoding.UTF8);
                String line;
                string jsonStr = "";
                while ((line = sr.ReadLine()) != null)
                {
                    jsonStr += line.ToString();
                }

                ArrayList dList = new ArrayList();
                JObject featureCollection = (JObject)JsonConvert.DeserializeObject(jsonStr);
                JArray features = (JArray)JsonConvert.DeserializeObject(featureCollection["features"].ToString());
                foreach (JObject feature in features)
                {
                    int districtCode = 0;
                    var property = feature["properties"];
                    var geometry = feature["geometry"];
                    var name = property["NAME"].ToString();
                    var qx = property["QX"].ToString();
                    if (qx == "崇明县")
                    {
                        qx = "崇明区";
                    }
                    foreach (DataRow dr in districtTable.Rows)
                    {
                        if (dr["MC"].ToString() == qx)
                        {
                            districtCode = Convert.ToInt32(dr["DM"]);
                        }
                    }
                    DataRow dr1 = blockTable.NewRow();
                    dr1["MC"] = name;
                    dr1["DistrictCode"] = districtCode;
                    blockTable.Rows.Add(dr1);
                }
                blockTable.TableName = "D_Block";
                db.ExecuteTransactionScopeInsert(blockTable, "D_Block");
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //上海商圈excel入库
        public string AnalyzeSHSQData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable districtTable = db.GetDataTable("select * from D_District");

                DataTable sourceTable = db.GetDataTable("select top 0 * from T_BusinessDistrict");

                if(type == "upload" )
                {
                    db.Execute("delete from T_BusinessDistrict");
                }

                DataSet data = ReadExcelAsDatatable(filePath);
                DataTable sj = data.Tables[0];
                DataTable zxcq = data.Tables[1];
                for(int i = 1;i<sj.Rows.Count;i++)
                {
                    DataRow dr = sj.Rows[i];
                    double lon = Convert.ToDouble(dr[3]);
                    double lat = Convert.ToDouble(dr[4]);
                    int classCode = 0;
                    string name = dr[1].ToString();
                    string area = dr[2].ToString();
                    double[] tp = Wgs84ToGcj02(lon, lat);
                    int districtCode = 0;
                    foreach (DataRow datarow in districtTable.Rows)
                    {
                        if (datarow[1].ToString() == dr[0].ToString())
                        {
                            districtCode = Convert.ToInt32(datarow[0]);
                            break;
                        }
                    }
                    DataRow ndr = sourceTable.NewRow();
                    ndr["Longitude"] = tp[0];
                    ndr["Latitude"] = tp[1];
                    ndr["Name"] = name;
                    ndr["ClassCode"] = classCode;
                    ndr["Area"] = area;
                    ndr["DistrictCode"] = districtCode;
                    if (type == "edit")
                    {
                        db.Execute("delete from T_BusinessDistrict where Name = '" + name + "'");
                    }
                    sourceTable.Rows.Add(ndr);
                }
                for (int i = 1; i < zxcq.Rows.Count; i++)
                {
                    DataRow dr = zxcq.Rows[i];
                    double lon = Convert.ToDouble(dr[3]);
                    double lat = Convert.ToDouble(dr[4]);
                    int classCode = 1;
                    string name = dr[1].ToString();
                    string area = dr[2].ToString();
                    double[] tp = Wgs84ToGcj02(lon, lat);
                    int districtCode = 0;
                    foreach (DataRow datarow in districtTable.Rows)
                    {
                        if (datarow[1].ToString() == dr[0].ToString())
                        {
                            districtCode = Convert.ToInt32(datarow[0]);
                            break;
                        }
                    }
                    DataRow ndr = sourceTable.NewRow();
                    ndr["Longitude"] = tp[0];
                    ndr["Latitude"] = tp[1];
                    ndr["Name"] = name;
                    ndr["ClassCode"] = classCode;
                    ndr["Area"] = area;
                    ndr["DistrictCode"] = districtCode;
                    if (type == "edit")
                    {
                        db.Execute("delete from T_BusinessDistrict where Name = '" + name + "'");
                    }
                    sourceTable.Rows.Add(ndr);
                }
                db.ExecuteTransactionScopeInsert(sourceTable, "T_BusinessDistrict");
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        public class District
        {
            public string Name { get; set; }
            public PointF[] Poly { get; set; }
        }

        public class PointF
        {
            public double X { get; set; }
            public double Y { get; set; }
        }
        public bool rayCasting(PointF p, PointF[] poly)
        {
            var px = p.X;
            var py = p.Y;
            var flag = false;

            int l = poly.Length;
            int j = l - 1;

            for (var i = 0; i < l; i++)
            {
                var sx = poly[i].X;
                var sy = poly[i].Y;
                var tx = poly[j].X;
                var ty = poly[j].Y;

                // 点与多边形顶点重合
                if ((sx == px && sy == py) || (tx == px && ty == py))
                {
                    return true;
                }
                // 判断线段两端点是否在射线两侧
                if ((sy < py && ty >= py) || (sy >= py && ty < py))
                {
                    // 线段上与射线 Y 坐标相同的点的 X 坐标
                    var x = sx + (py - sy) * (tx - sx) / (ty - sy);
                    // 点在多边形的边上
                    if (x == px)
                    {
                        return true;
                    }
                    // 射线穿过多边形的边界
                    if (x > px)
                    {
                        flag = !flag;
                    }
                }
                j = i;
            }
            // 射线穿过多边形边界的次数为奇数时点在多边形内
            return flag ? true : false;
        }


        public static double x_PI = Math.PI * 3000.0 / 180.0;
        public static double PI = Math.PI;
        public static double ee = 0.00669342162296594323;
        public static double a = 6378245.0;
        private static double Transformlat(double lng, double lat)
        {
            double ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.Sqrt(Math.Abs(lng));
            ret += (20.0 * Math.Sin(6.0 * lng * PI) + 20.0 * Math.Sin(2.0 * lng * PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.Sin(lat * PI) + 40.0 * Math.Sin(lat / 3.0 * PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.Sin(lat / 12.0 * PI) + 320 * Math.Sin(lat * PI / 30.0)) * 2.0 / 3.0;
            return ret;
        }

        private static double Transformlng(double lng, double lat)
        {
            double ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.Sqrt(Math.Abs(lng));
            ret += (20.0 * Math.Sin(6.0 * lng * PI) + 20.0 * Math.Sin(2.0 * lng * PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.Sin(lng * PI) + 40.0 * Math.Sin(lng / 3.0 * PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.Sin(lng / 12.0 * PI) + 300.0 * Math.Sin(lng / 30.0 * PI)) * 2.0 / 3.0;
            return ret;
        }
        public double[] Wgs84ToGcj02(double lng, double lat)
        {
            double dlat = Transformlat(lng - 105.0, lat - 35.0);
            double dlng = Transformlng(lng - 105.0, lat - 35.0);
            double radlat = lat / 180.0 * Math.PI;
            double magic = Math.Sin(radlat);
            magic = 1 - ee * magic * magic;
            double sqrtmagic = Math.Sqrt(magic);
            dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (a / sqrtmagic * Math.Cos(radlat) * PI);
            double mglat = lat + dlat;
            double mglng = lng + dlng;
            return new double[] { mglng, mglat };
        }
        //异地消费Excel入库
        public string AnalyzeYDXFDSRata(string filePath,string type)
        {
            string result = "ok";
            try
            {
                
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_NonLocalConsumption");

                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable ydxf = data.Tables[0];
                        for(int i =1;i<ydxf.Rows.Count;i++)
                        {
                            DataRow dr = ydxf.Rows[i];
                            DataRow ndr = sourceTable.NewRow();
                            DateTime dt = Convert.ToDateTime(dr[0].ToString());
                            ndr["Time"] = dt;
                            ndr["OriginCity"] = dr[1].ToString();
                            ndr["Industry"] = dr[2].ToString();
                            ndr["TargetCity"] = "上海市";
                            ndr["Sum"] = Convert.ToDouble(dr[3]);
                            if(type == "edit")
                            {
                                db.Execute("delete from T_NonLocalConsumption where OriginCity = '" + dr[1].ToString() + "' and Industry = '" + dr[2].ToString() + "'");
                            }
                            sourceTable.Rows.Add(ndr);
                        }
                        db.ExecuteTransactionScopeInsert(sourceTable, "T_NonLocalConsumption");
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        public string AnalyzeYDXFDSCata(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_NonLocalConsumption");
                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable ydxf = data.Tables[0];
                        for (int i = 1; i < ydxf.Rows.Count; i++)
                        {
                            DataRow dr = ydxf.Rows[i];
                            DataRow ndr = sourceTable.NewRow();
                            DateTime dt = Convert.ToDateTime(dr[0].ToString());
                            ndr["Time"] = dt;
                            ndr["TargetCity"] = dr[1].ToString();
                            ndr["Industry"] = dr[2].ToString();
                            ndr["OriginCity"] = "上海市";
                            ndr["Sum"] = Convert.ToDouble(dr[3]);
                            if (type == "edit")
                            {
                                db.Execute("delete from T_NonLocalConsumption where TargetCity = '" + dr[1].ToString() + "' and Industry = '" + dr[2].ToString() + "'");
                            }
                            sourceTable.Rows.Add(ndr);
                        }
                    }
                }
                db.ExecuteTransactionScopeInsert(sourceTable, "T_NonLocalConsumption");
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //区县销售额Excel入库
        public string AnalyzeQXXSEData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_DistrictConsumption");

                DataTable districtTable = db.GetDataTable("select * from D_District");

                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable qxxsz = data.Tables[0];
                        //DateTime Time = Convert.ToDateTime(qxxsz.Rows[0][0].ToString());
                        for (var i = 1; i < qxxsz.Rows.Count; i++)
                        {
                            DataRow dr = qxxsz.Rows[i];
                            string district = dr[1].ToString();
                            int dCode = 0;
                            foreach(DataRow ddr in districtTable.Rows)
                            {
                                if(district == ddr["MC"].ToString())
                                {
                                    dCode = Convert.ToInt32(ddr["DM"]);
                                    break;
                                }
                            }
                            DataRow insert = sourceTable.NewRow();
                            insert["Time"] = dr[0].ToString();
                            insert["DistrictCode"] = dCode;
                            insert["Industry"] = dr[2].ToString();
                            insert["Sum"] = Convert.ToDouble(dr[5]);
                            insert["CardTime"] = Convert.ToDouble(dr[3]);
                            insert["CardSum"] = Convert.ToDouble(dr[4]);
                            if(type == "edit")
                            {
                                db.Execute("delete from T_DistrictConsumption where Time='" + dr[0].ToString()+ "' and DistrictCode = " + dCode);
                            }
                            sourceTable.Rows.Add(insert);
                        }
                        db.ExecuteTransactionScopeInsert(sourceTable, "T_DistrictConsumption");
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //商圈行业每月横向比较统计入库
        public string AnalyzeSQHYHXBJData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_IndustryTrade");

                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable sqhy = data.Tables[0];
                        for (var i = 1; i < sqhy.Rows.Count; i++)
                        {
                            DataRow dr = sqhy.Rows[i];
                            DateTime Time = Convert.ToDateTime(dr[0].ToString());
                            DataRow insert = sourceTable.NewRow();
                            insert["Time"] = Time;
                            insert["Name"] = dr[3].ToString();
                            insert["Industry"] = dr[2].ToString();
                            insert["TradeSum"] = Convert.ToDouble(dr[4]);
                            insert["TradeTime"] = Convert.ToDouble(dr[5]);
                            insert["MID"] = Convert.ToDouble(dr[6]);
                            insert["TradeAverage"] = Convert.ToDouble(dr[4])/Convert.ToDouble(dr[5]);
                            insert["SumDensity"] = Convert.ToDouble(dr[7]);
                            insert["TimeDensity"] = Convert.ToDouble(dr[8]);
                            insert["MIDDensity"] = Convert.ToDouble(dr[9]);
                            if(type == "edit")
                            {
                                db.Execute("delete from T_IndustryTrade where Time = '" + Time + "' and Name = '" + dr[3].ToString() + "'");
                            }
                            sourceTable.Rows.Add(insert);
                        }
                        db.ExecuteTransactionScopeInsert(sourceTable, "T_IndustryTrade");
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //商圈刷卡来源地统计入库
        public string AnalyzeSKLYDData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_CardSource");

                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable skly = data.Tables[0];
                        for (var i = 1; i < skly.Rows.Count; i++)
                        {
                            DataRow dr = skly.Rows[i];
                            DataRow insert = sourceTable.NewRow();
                            insert["Name"] = dr[2].ToString();
                            insert["Time"] = Convert.ToDateTime(dr[0].ToString());
                            insert["Source"] = dr[3].ToString();
                            insert["Sum"] = Convert.ToDouble(dr[4]);

                            if(type == "edit")
                            {
                                db.Execute("delete from T_CardSource where Name='" + dr[2].ToString()+ "' and Time = '" + Convert.ToDateTime(dr[0].ToString()) + "'");
                            }

                            sourceTable.Rows.Add(insert);
                        }
                        db.ExecuteTransactionScopeInsert(sourceTable, "T_CardSource");
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //商圈消费人群标签统计入库
        public string AnalyzeXFRQBQData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_CustomerProperty");

                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable sfrqbq = data.Tables[0];
                        for (var i = 1; i < sfrqbq.Rows.Count; i++)
                        {
                            DataRow dr = sfrqbq.Rows[i];
                            DataRow insert = sourceTable.NewRow();
                            insert["Name"] = dr[1].ToString();
                            insert["Time"] = Convert.ToDateTime(dr[0].ToString());
                            insert["Property"] = dr[2].ToString();
                            insert["Threshold"] = dr[3].ToString();
                            insert["Percent"] = Convert.ToDouble(dr[4])*100;
                            if(type == "edit")
                            {
                                db.Execute("delete from T_CustomerProperty where Name = '" + dr[1].ToString()+ "' and Time = '" + Convert.ToDateTime(dr[0].ToString()) +"'");
                            }
                            sourceTable.Rows.Add(insert);
                        }
                        db.ExecuteTransactionScopeInsert(sourceTable, "T_CustomerProperty");
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //商圈共享客流统计入库
        public string AnalyzeGXKLData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_BusinessDistrictShare");

                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable gxkl = data.Tables[0];
                        for (var i = 1; i < gxkl.Rows.Count; i++)
                        {
                            DataRow dr = gxkl.Rows[i];
                            DataRow insert = sourceTable.NewRow();
                            insert["TargetBD"] = dr[4].ToString();
                            insert["SourceBD"] = dr[2].ToString();
                            insert["Sum"] = Convert.ToDouble(dr[5].ToString());
                            insert["TradeTime"] = Convert.ToDouble(dr[6].ToString());
                            insert["CardTime"] = Convert.ToDouble(dr[7].ToString());
                            insert["Time"] = Convert.ToDateTime(dr[0]);
                            if(type == "edit")
                            {
                                db.Execute("delete from T_BusinessDistrictShare where Time = '" + Convert.ToDateTime(dr[0]) + "' and SourceBD = '" + dr[2].ToString() + "'");
                            }
                            sourceTable.Rows.Add(insert);
                        }
                        db.ExecuteTransactionScopeInsert(sourceTable, "T_BusinessDistrictShare");
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //商圈客流入库
        public string AnalyzeSQKLData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_BDCustomerFlow");

                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable sqkl = data.Tables[0];
                        for (var i = 1; i < sqkl.Rows.Count; i++)
                        {
                            DataRow dr = sqkl.Rows[i];
                            DataRow insert = sourceTable.NewRow();
                            insert["Name"] = dr[1].ToString();
                            insert["Sum"] = Convert.ToDouble(dr[2].ToString());
                            //insert["Local"] = Convert.ToInt32(dr[1].ToString());
                            insert["Time"] = Convert.ToDateTime(dr[0]);
                            insert["Density"] = Convert.ToDouble(dr[3].ToString());
                            if(type == "edit")
                            {
                                db.Execute("delete from T_BDCustomerFlow where Name = '" + dr[1].ToString() + "' and Time = '" + Convert.ToDateTime(dr[0]) + "'");
                            }
                            sourceTable.Rows.Add(insert);
                        }
                        db.ExecuteTransactionScopeInsert(sourceTable, "T_BDCustomerFlow");
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //POI入库
        public string AnalyzePOIData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                if(type == "upload")
                {
                    db.Execute("delete from T_POI");
                }
                
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_POI");

                DataTable districtTable = db.GetDataTable("select * from D_District");

                DataTable poiTable = db.GetDataTable("select * from D_POICategory");

                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable poi = data.Tables[0];
                        for (var i = 1; i < poi.Rows.Count; i++)
                        {
                            DataRow dr = poi.Rows[i];
                            string district = dr[5].ToString();
                            int dCode = 0;
                            foreach (DataRow ddr in districtTable.Rows)
                            {
                                if (district == ddr["MC"].ToString())
                                {
                                    dCode = Convert.ToInt32(ddr["DM"]);
                                    break;
                                }
                            }
                            int poiCode = 0;
                            string category = dr[1].ToString();
                            foreach (DataRow ddr in poiTable.Rows)
                            {
                                if (category == ddr["MC"].ToString())
                                {
                                    poiCode = Convert.ToInt32(ddr["DM"]);
                                    break;
                                }
                            }
                            DataRow insert = sourceTable.NewRow();
                            insert["Name"] = dr[0].ToString();
                            double[] tp = Wgs84ToGcj02(Convert.ToDouble(dr[4]), Convert.ToDouble(dr[3]));
                            insert["Longitude"] = tp[0].ToString();
                            insert["Latitude"] = tp[1].ToString();
                            insert["Address"] = dr[2].ToString();
                            insert["DistrictCode"] = dCode;
                            insert["Area"] = dr[6].ToString();
                            insert["Category"] = poiCode;
                            if(type == "edit")
                            {
                                db.Execute("delete from T_POI where Name = '" + dr[0].ToString() + "'" );
                            }
                            sourceTable.Rows.Add(insert);
                        }
                        db.ExecuteTransactionScopeInsert(sourceTable, "T_POI");
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //POI-地铁公交
        public string AnalyzePOITrafficData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                if (type == "upload")
                {
                    db.Execute("delete from T_POITraffic");
                }

                DataTable sourceTable = db.GetDataTable("select top 0 * from T_POITraffic");

                DataTable districtTable = db.GetDataTable("select * from D_District");

                StreamReader sr = new StreamReader(@"D:\publish\web\data\上海区县_GCJ02.json", Encoding.UTF8);
                //StreamReader sr = new StreamReader(@"E:\复旦商圈项目\services\WcfService\WcfService\data\上海区县_GCJ02.json", Encoding.UTF8);
                String line;
                string jsonStr = "";
                while ((line = sr.ReadLine()) != null)
                {
                    jsonStr += line.ToString();
                }

                JObject featureCollection = (JObject)JsonConvert.DeserializeObject(jsonStr);
                JArray features = (JArray)JsonConvert.DeserializeObject(featureCollection["features"].ToString());

                DataSet data = ReadExcelAsDatatable(filePath);
                DataTable table = data.Tables[0];
                for (var i = 1; i < table.Rows.Count; i++)
                {
                    DataRow dr = table.Rows[i];
                    DataRow insert = sourceTable.NewRow();
                    int districtCode = 0;
                    string district = "";
                    double[] tp = Wgs84ToGcj02(Convert.ToDouble(dr[0]), Convert.ToDouble(dr[1]));
                    PointF checkPoint = new PointF();
                    checkPoint.X = tp[0];
                    checkPoint.Y = tp[1];
                    foreach (JObject feature in features)
                    {
                        var property = feature["properties"];
                        var geometry = feature["geometry"];
                        var gType = geometry["type"].ToString();
                        if(gType == "MultiPolygon")
                        {
                            JArray coordinates = (JArray)JsonConvert.DeserializeObject(geometry["coordinates"].ToString());
                            foreach (JArray coor in coordinates[0])
                            {
                                JArray points = (JArray)JsonConvert.DeserializeObject(coor.ToString());
                                PointF[] poly = new PointF[points.Count];
                                int polyCount = 0;
                                foreach (JArray point in points)
                                {
                                    PointF pF = new PointF();
                                    pF.X = Convert.ToDouble(point[0]);
                                    pF.Y = Convert.ToDouble(point[1]);
                                    poly[polyCount] = pF;
                                    polyCount++;
                                }
                                bool inOut = rayCasting(checkPoint, poly);
                                if (inOut)
                                {
                                    district = property["NAME"].ToString();
                                    break;
                                }
                            }
                        }
                        else
                        {
                            JArray coordinates = (JArray)JsonConvert.DeserializeObject(geometry["coordinates"][0].ToString());
                            PointF[] poly = new PointF[coordinates.Count];
                            int polyCount = 0;
                            foreach(JArray point in coordinates)
                            {
                                PointF pF = new PointF();
                                pF.X = Convert.ToDouble(point[0]);
                                pF.Y = Convert.ToDouble(point[1]);
                                poly[polyCount] = pF;
                                polyCount++;
                            }
                            bool inOut = rayCasting(checkPoint,poly);
                            if (inOut)
                            {
                                district = property["NAME"].ToString();
                                break;
                            }
                        }  
                    }
                    foreach (DataRow ddr in districtTable.Rows)
                    {
                        if (district == ddr["MC"].ToString())
                        {
                            districtCode = Convert.ToInt32(ddr["DM"]);
                            break;
                        }
                    }
                    insert["Longitude"] = tp[0].ToString();
                    insert["Latitude"] = tp[1].ToString();
                    insert["Name"] = dr[2].ToString();
                    insert["Route"] = dr[3].ToString();
                    insert["DistrictCode"] = districtCode;
                    string cc = "";
                    if (dr[2].ToString().IndexOf("公交站") > -1)
                    {
                        insert["Category"] = "公交";
                        cc = "公交";
                    }
                    else
                    {
                        insert["Category"] = "地铁";
                        cc = "地铁";
                    }
                    if (type == "edit")
                    {
                        db.Execute("delete from T_POITraffic where Name = '" + dr[2].ToString() + "'");
                    }
                    sourceTable.Rows.Add(insert);
                    //db.Execute(string.Format("insert into T_POITraffic values('{0}','{1}','{2}','{3}','{4}',{5})", tp[0].ToString(), tp[1].ToString(), dr[2].ToString(), dr[3].ToString(),cc,districtCode));
                }
                db.ExecuteTransactionScopeInsert(sourceTable, "T_POITraffic");
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //小时客流入库
        public string AnalyzeCustomerFlowData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_CustomerFlow");

                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable xskl = data.Tables[0];
                        for (var i = 1; i < xskl.Rows.Count; i++)
                        {
                            DataRow dr = xskl.Rows[i];
                            DataRow insert = sourceTable.NewRow();
                            insert["Time"] = Convert.ToDateTime(dr[0].ToString());
                            insert["Lon"] = dr[1].ToString();
                            insert["Lat"] = dr[2].ToString();
                            insert["Sum"] = Convert.ToDouble(dr[3]);
                            if (type == "edit")
                            {
                                db.Execute("delete from T_CustomerFlow where Time = '" + Convert.ToDateTime(dr[0].ToString()) + "' and Lon='" + dr[1].ToString() + "' and Lat = '" + dr[2].ToString() + "'");
                            }
                            sourceTable.Rows.Add(insert);
                        }
                        db.ExecuteTransactionScopeInsert(sourceTable, "T_CustomerFlow");
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //各区人口入库
        public string AnalyzeDistrictPopulationData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                if(type == "update")
                {
                    db.Execute("delete from T_DistrictPopulation");
                }
               
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_DistrictPopulation");

                DataTable districtTable = db.GetDataTable("select * from D_District");

                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var data = reader.AsDataSet();
                        DataTable dp = data.Tables[0];
                        for (var i = 1; i < dp.Rows.Count; i++)
                        {
                            DataRow dr = dp.Rows[i];
                            string district = dr[0].ToString();
                            int dCode = 0;
                            foreach (DataRow ddr in districtTable.Rows)
                            {
                                if (district == ddr["MC"].ToString())
                                {
                                    dCode = Convert.ToInt32(ddr["DM"]);
                                    break;
                                }
                            }
                            DataRow insert = sourceTable.NewRow();
                            insert["DistrictCode"] = dCode;
                            insert["Population"] = Convert.ToDouble(dr[1].ToString());
                            insert["Density"] = Convert.ToDouble(dr[2].ToString());
                            if (type == "edit")
                            {
                                db.Execute("delete from T_DistrictPopulation where DistrictCode = " + dCode);
                            }
                            sourceTable.Rows.Add(insert);
                        }
                        db.ExecuteTransactionScopeInsert(sourceTable, "T_DistrictPopulation");
                    }
                }
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //商圈周边人口
        public string AnalyzeSQZBRKData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_BDPopulation");

                DataSet data = ReadExcelAsDatatable(filePath);
                DataTable table = data.Tables[0];
                for (var i = 1; i < table.Rows.Count; i++)
                {
                    DataRow dr = table.Rows[i];
                    DataRow insert = sourceTable.NewRow();
                    insert["Name"] = dr[1].ToString();
                    insert["Population"] = Convert.ToDouble(dr[2].ToString());
                    insert["Time"] = dr[0].ToString();
                    insert["Density"] = Convert.ToDouble(dr[3].ToString());
                    if(type == "edit")
                    {
                        db.Execute("delete from T_BDPopulation where Name = '" + dr[1].ToString() + "' and Time = '" + dr[0].ToString() + "'");
                    }
                    sourceTable.Rows.Add(insert);
                }
                db.ExecuteTransactionScopeInsert(sourceTable, "T_BDPopulation");
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //商圈客流来源地
        public string AnalyzeSQKLLYDData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_BDCustomerSource");

                DataTable districtTable = db.GetDataTable("select * from D_District");

                DataSet data = ReadExcelAsDatatable(filePath);
                DataTable table = data.Tables[0];
                for (var i = 1; i < table.Rows.Count; i++)
                {
                    DataRow dr = table.Rows[i];
                    string district = dr[2].ToString();
                    int dCode = 0;
                    foreach (DataRow ddr in districtTable.Rows)
                    {
                        if (ddr["MC"].ToString().IndexOf(district.Substring(0,2)) > -1)
                        {
                            dCode = Convert.ToInt32(ddr["DM"]);
                            break;
                        }
                    }
                    DataRow insert = sourceTable.NewRow();
                    insert["Time"] = Convert.ToDateTime(dr[0].ToString());
                    insert["DistrictCode"] = dCode;
                    insert["Name"] = dr[1].ToString();
                    insert["Num"] = Convert.ToDouble(dr[3].ToString());
                    if (type == "edit")
                    {
                        db.Execute("delete from T_BDCustomerSource where Name = '" + dr[1].ToString() + "' and Time = '" + Convert.ToDateTime(dr[0].ToString()) + "'");
                    }
                    sourceTable.Rows.Add(insert);
                }
                db.ExecuteTransactionScopeInsert(sourceTable, "T_BDCustomerSource");
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //商圈交通指数
        public string AnalyzeSQJTZSDData(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_BDTrafficIndex");

                if(type == "uploiad")
                {
                    db.Execute("delete from T_BDTrafficIndex");
                }

                DataSet data = ReadExcelAsDatatable(filePath);
                DataTable table = data.Tables[0];
                for (var i = 1; i < table.Rows.Count; i++)
                {
                    DataRow dr = table.Rows[i];
                    DataRow insert = sourceTable.NewRow();
                    insert["Name"] = dr[0].ToString();
                    insert["Num"] = Convert.ToDouble(dr[1].ToString());
                    if(type == "edit")
                    {
                        db.Execute("delete from T_BDTrafficIndex where Name = '" + dr[0].ToString() + "'");
                    }
                    sourceTable.Rows.Add(insert);
                }
                db.ExecuteTransactionScopeInsert(sourceTable, "T_BDTrafficIndex");
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

        //区交通便利指数
        public string AnalyzeGQJTBLata(string filePath,string type)
        {
            string result = "ok";
            try
            {
                DataTable sourceTable = db.GetDataTable("select top 0 * from T_DistrictTrafficIndex");
                
                if(type == "update")
                {
                    db.Execute("delete from T_DistrictTrafficIndex");
                }
                
                DataTable districtTable = db.GetDataTable("select * from D_District");

                DataSet data = ReadExcelAsDatatable(filePath);
                DataTable table = data.Tables[0];
                for (var i = 1; i < table.Rows.Count; i++)
                {
                    DataRow dr = table.Rows[i];
                    string district = dr[0].ToString().Trim();
                    int dCode = 0;
                    foreach (DataRow ddr in districtTable.Rows)
                    {
                        if (ddr["MC"].ToString().IndexOf(district) > -1)
                        {
                            dCode = Convert.ToInt32(ddr["DM"]);
                            break;
                        }
                    }
                    DataRow insert = sourceTable.NewRow();
                    insert["DistrictCode"] = dCode;
                    insert["TrafficIndex"] = Convert.ToDouble(dr[1].ToString());
                    if (type == "edit")
                    {
                    }
                    sourceTable.Rows.Add(insert);
                }
                db.ExecuteTransactionScopeInsert(sourceTable, "T_DistrictTrafficIndex");
            }
            catch (Exception ex)
            {
                result = ex.Message + "||" + ex.StackTrace;
            }

            return result;
        }

    }
}