
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
    Chart.defaults.set('plugins.datalabels', {
        color: '#fff',
        font: {
            weight: 'bold',
            size: 10
        },
        formatter: function(value, context) {
            if (value === 0) return '';
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
        },
        display: function(context) {
            let val = context.dataset.data[context.dataIndex];
            if (val <= 0) return false;
            let type = context.chart.config.type;
            if (type === 'doughnut' || type === 'pie') {
                let meta = context.chart.getDatasetMeta(context.datasetIndex);
                if (meta && meta.total > 0) {
                    if ((val / meta.total) < 0.04) return false;
                }
            }
            return 'auto';
        },
        anchor: function(context) {
            let type = context.chart.config.type;
            if (type === 'bar' || type === 'line') return 'end';
            return 'center';
        },
        align: function(context) {
            let type = context.chart.config.type;
            if (type === 'bar') return 'end';
            if (type === 'line') return 'top';
            return 'center';
        },
        offset: function(context) {
            let type = context.chart.config.type;
            return (type === 'bar' || type === 'line') ? 4 : 0;
        },
        clamp: true
    });
}
