using System;
using System.Collections.Generic;
using System.Threading;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace SignalR_D3ChartApplication.SignalR
{
    public class ChartData
    {
        public static readonly Lazy<ChartData> Data = new Lazy<ChartData>(() => new ChartData());
        private readonly object _dataLock = new object();
        private readonly Random _rand;
        private Timer _timer;
        private int _numPoints;

        public ChartData()
        {
            _rand = new Random();
        }

        public static ChartData Instance
        {
            get { return Data.Value; }
        }

        public void GenerateNextDataPoint(object state)
        {
            lock (_dataLock)
            {
                var dataPoints = new List<DataPoint>();

                for (var i = 0; i < 1; i++)
                {
                    dataPoints.Add(new DataPoint() { X = i + 1, Y = _rand.Next(-100, 100) });
                }

                GetClients().All.updateNewDataPointValues(dataPoints);
            }
        }

        public IHubConnectionContext<dynamic> GetClients()
        {
            return GlobalHost.ConnectionManager.GetHubContext<DataHub>().Clients;
        }

        public IEnumerable<DataPoint> PublishDataPoints(int numPoints)
        {
            var dataPoints = new List<DataPoint>();
            _numPoints = numPoints;

            for (var i = 0; i < numPoints; i++)
            {
                dataPoints.Add(new DataPoint(){X = i + 1,Y = _rand.Next(-100, 100)});
            }

            if (_timer == null)
            {
                _timer = new Timer(GenerateNextDataPoint, null, 20, 20);
            }

            return dataPoints;
        }
    }
}