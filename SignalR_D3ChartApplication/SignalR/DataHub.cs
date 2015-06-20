using Microsoft.AspNet.SignalR;

namespace SignalR_D3ChartApplication.SignalR
{
    public class DataHub : Hub
    {
        public void GetInitialDataPoints(int numPoints)
        {
            Clients.All.InitiateChart(ChartData.Instance.PublishDataPoints(numPoints));
        }
    }
}