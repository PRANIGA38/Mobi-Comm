
        // Show button when scrolling down
        window.onscroll = function () {
            let scrollBtn = document.getElementById("scrollTopBtn");
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                scrollBtn.style.display = "block";
            } else {
                scrollBtn.style.display = "none";
            }
        };

        // Scroll to top function
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        // Revenue Chart
        function createRevenueChart() {
            const ctx = document.getElementById('revenueChart').getContext('2d');
            const revenueChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Revenue (₹ in Lakhs)',
                        data: [2.8, 3.1, 3.5, 3.2, 3.4, 3.7, 3.9, 4.2, 4.5, 4.8, 5.1, 5.4],
                        backgroundColor: 'rgba(74, 111, 255, 0.1)',
                        borderColor: '#4A6FFF',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#4A6FFF'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                drawBorder: false,
                                color: 'rgba(200, 200, 200, 0.2)'
                            },
                            ticks: {
                                callback: function (value) {
                                    return '₹' + value + 'L';
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            backgroundColor: '#1E1E1E',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            titleFont: {
                                family: 'Poppins',
                                size: 14
                            },
                            bodyFont: {
                                family: 'Poppins',
                                size: 13
                            },
                            padding: 10,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                label: function (context) {
                                    return 'Revenue: ₹' + context.parsed.y + ' Lakhs';
                                }
                            }
                        },
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }

        // Plan Distribution Chart
        function createPlanDistributionChart() {
            const ctx = document.getElementById('planDistributionChart').getContext('2d');
            const planDistributionChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [
                        'Unlimited 3GB/Day',
                        'Super Value Pack',
                        'Weekend Data Pack',
                        'Annual Unlimited',
                        'Family Plan'
                    ],
                    datasets: [{
                        data: [1243, 987, 876, 543, 432],
                        backgroundColor: [
                            '#4A6FFF',
                            '#FF4A76',
                            '#28C76F',
                            '#FF9F43',
                            '#00CFE8'
                        ],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    family: 'Poppins',
                                    size: 12
                                },
                                boxWidth: 12,
                                padding: 15
                            }
                        },
                        tooltip: {
                            backgroundColor: '#1E1E1E',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            titleFont: {
                                family: 'Poppins',
                                size: 14
                            },
                            bodyFont: {
                                family: 'Poppins',
                                size: 13
                            },
                            padding: 10,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                label: function (context) {
                                    return context.label + ': ' + context.parsed + ' subscribers';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Subscriber Growth Chart
        function createSubscriberGrowthChart() {
            const ctx = document.getElementById('subscriberGrowthChart').getContext('2d');
            const subscriberGrowthChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'New Subscribers',
                        data: [120, 135, 140, 152, 168, 175, 188, 201, 220, 235, 248, 256],
                        backgroundColor: '#4A6FFF',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                drawBorder: false,
                              color: 'rgba(200, 200, 200, 0.2)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#1E1E1E',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            cornerRadius: 8,
                            displayColors: false
                        }
                    }
                }
            });
        }

        // Data Usage Chart
        function createDataUsageChart() {
            const ctx = document.getElementById('dataUsageChart').getContext('2d');
            const dataUsageChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Data Usage (TB)',
                        data: [5.2, 5.5, 5.8, 6.1, 6.3, 6.7, 7.0, 7.3, 7.8, 8.2, 8.5, 8.9],
                        borderColor: '#FF4A76',
                        backgroundColor: 'rgba(255, 74, 118, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointBackgroundColor: '#FF4A76'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: {
                                drawBorder: false,
                                color: 'rgba(200, 200, 200, 0.2)'
                            },
                            ticks: {
                                callback: function (value) {
                                    return value + ' TB';
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#1E1E1E',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                label: function (context) {
                                    return 'Usage: ' + context.parsed.y + ' TB';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize All Charts
        document.addEventListener('DOMContentLoaded', function () {
            createRevenueChart();
            createPlanDistributionChart();
            createSubscriberGrowthChart();
            createDataUsageChart();

            // Mobile sidebar toggle
            const sidebarToggle = document.getElementById('sidebarToggle');
            const mobileSidebar = document.getElementById('mobileSidebar');
            
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', function () {
                    mobileSidebar.classList.toggle('show');
                });
            }

            // Date filter buttons
            const dateFilterBtns = document.querySelectorAll('.date-filter-btn');
            dateFilterBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    dateFilterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    // Here you would update the data based on the selected period
                    // For demonstration, we'll just show an alert
                    alert(`Filtering data for ${this.dataset.period} view`);
                });
            });

            // Add fade-in animations
            const elements = document.querySelectorAll('.card');
            elements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('fade-in');
                }, index * 100);
            });
        });
    