import os
import pandas as pd
import matplotlib.pyplot as plt

test_dirs = ['1', '2', '3', '4']

# Per-test visualizations (each test gets its own visualizations folder)
for test in test_dirs:
    test_path = os.path.join('tests', test)
    
    # Load CSV files
    stats = pd.read_csv(os.path.join(test_path, 'locust_stats.csv'))
    stats_history = pd.read_csv(os.path.join(test_path, 'locust_stats_history.csv'))
    failures = pd.read_csv(os.path.join(test_path, 'locust_failures.csv'))
    cpu_usage = pd.read_csv(os.path.join(test_path, 'cpu_usage.csv'))

    # Create directory for visualizations inside each test directory
    vis_dir = os.path.join(test_path, 'visualizations')
    os.makedirs(vis_dir, exist_ok=True)

    # 1. Request Latency per Endpoint
    plt.figure(figsize=(10, 6))
    plt.bar(stats['Name'], stats['Average Response Time'], color='skyblue')
    plt.xlabel('Endpoint')
    plt.ylabel('Average Response Time (ms)')
    plt.title(f'Average Request Latency per Endpoint (Test {test})')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(os.path.join(vis_dir, 'request_latency.png'))
    plt.close()

    # 2. Throughput Over Time
    plt.figure(figsize=(10, 6))
    plt.plot(stats_history['Timestamp'], 
             stats_history['Total Request Count'] / stats_history['Timestamp'].max(), 
             color='green')
    plt.xlabel('Time (seconds)')
    plt.ylabel('Throughput (requests/sec)')
    plt.title(f'Throughput Over Time (Test {test})')
    plt.tight_layout()
    plt.savefig(os.path.join(vis_dir, 'throughput.png'))
    plt.close()

    # 3. Error Rate per Endpoint
    if not failures.empty:
        error_counts = failures['Name'].value_counts()
        plt.figure(figsize=(10, 6))
        error_counts.plot(kind='bar', color='red')
        plt.xlabel('Endpoint')
        plt.ylabel('Number of Errors')
        plt.title(f'Error Rates per Endpoint (Test {test})')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(os.path.join(vis_dir, 'error_rates.png'))
        plt.close()
    else:
        print(f"No failures recorded for Test {test}, skipping error rate plot.")

    # 4. CPU Usage Over Time
    plt.figure(figsize=(10, 6))
    plt.plot(cpu_usage['timestamp'], cpu_usage['total_cpu_millicores'], color='purple')
    plt.xlabel('Time')
    plt.ylabel('CPU Usage (millicores)')
    plt.title(f'CPU Usage Over Time (Test {test})')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(os.path.join(vis_dir, 'cpu_usage.png'))
    plt.close()

    print(f"✅ Visualizations for Test {test} saved in: {vis_dir}")

# -------------------------------
# 📊 Comparative Summary Graphs
# These are saved in the root of load-tests directory
# -------------------------------

# Graph 1: Average Request Latency per Test
avg_latencies = []
for test in test_dirs:
    stats = pd.read_csv(os.path.join('tests', test, 'locust_stats.csv'))
    avg_latency = stats['Average Response Time'].mean()
    avg_latencies.append(avg_latency)

plt.figure(figsize=(10, 6))
plt.bar(test_dirs, avg_latencies, color='royalblue')
plt.xlabel('Test Number')
plt.ylabel('Average Latency (ms)')
plt.title('Comparative Average Request Latency per Test')
plt.tight_layout()
plt.savefig('comparative_avg_latency.png')
plt.close()

# Graph 2: Peak Throughput per Test
peak_throughputs = []
for test in test_dirs:
    history = pd.read_csv(os.path.join('tests', test, 'locust_stats_history.csv'))
    throughput = history['Total Request Count'].iloc[-1] / history['Timestamp'].iloc[-1]
    peak_throughputs.append(throughput)

plt.figure(figsize=(10, 6))
plt.bar(test_dirs, peak_throughputs, color='seagreen')
plt.xlabel('Test Number')
plt.ylabel('Peak Throughput (req/sec)')
plt.title('Comparative Peak Throughput per Test')
plt.tight_layout()
plt.savefig('comparative_peak_throughput.png')
plt.close()

# Graph 3: Max CPU Usage per Test
max_cpu_usages = []
for test in test_dirs:
    cpu_usage = pd.read_csv(os.path.join('tests', test, 'cpu_usage.csv'))
    max_cpu = cpu_usage['total_cpu_millicores'].max()
    max_cpu_usages.append(max_cpu)

plt.figure(figsize=(10, 6))
plt.bar(test_dirs, max_cpu_usages, color='purple')
plt.xlabel('Test Number')
plt.ylabel('Max CPU Usage (millicores)')
plt.title('Comparative Max CPU Usage per Test')
plt.tight_layout()
plt.savefig('comparative_cpu_usage.png')
plt.close()

print("✅ Comparative summary graphs saved in: load-tests/")
