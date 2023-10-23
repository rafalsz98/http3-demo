import pandas as pd

def process_http_csv(filename, mode, proto):
    df = pd.read_csv(filename, delimiter=";")

    df_http_only = df[(df["http_version"] == proto) & (df["response_code"] == 200)]

    mean_http = df_http_only.mean()
    min_http = df_http_only.min()
    max_http = df_http_only.max()

    print(f"All HTTP/{proto} {mode} requests: {df.shape[0]}")
    print(f"Mismatched HTTP/{proto} {mode} requests: {df[df['http_version'] != proto].shape[0]}")
    print(f"Failed HTTP/{proto} {mode} requests: {df[df['response_code'] != 200].shape[0]}")
    print("")

    return min_http, mean_http, max_http

# Example files struct:
# files = [
#   ('http3asynctest.csv', 'async', 3),
#   ('http3synctest.csv', 'sync', 3)
# ]
def generate_df(files):
  data = {}
  metrics = ['Min', 'Mean', 'Max']

  for filename, mode, proto in files:
      min_val, mean_val, max_val = process_http_csv(filename, mode, proto)

      for metric, values in zip(metrics, [min_val, mean_val, max_val]):
          key = f"HTTP/{proto} {mode.capitalize()} {metric}"
          data[key] = values

  return pd.DataFrame(data, index=mean_val.keys())