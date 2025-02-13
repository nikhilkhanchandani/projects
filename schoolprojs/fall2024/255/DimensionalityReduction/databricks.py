%pip install umap-learn
file_path = "/dbfs/FileStore/tables/heart_failure_clinical_records_dataset.csv"
tabular_data = spark.read.csv(file_path, header=True, inferSchema=True).toPandas()

# Preprocessing
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
tabular_data_scaled = scaler.fit_transform(tabular_data.iloc[:, :-1])  


from umap import UMAP
import matplotlib.pyplot as plt

umap = UMAP(n_neighbors=15, n_components=2, random_state=42)
umap_transformed = umap.fit_transform(tabular_data_scaled)

plt.figure(figsize=(10, 6))
plt.scatter(umap_transformed[:, 0], umap_transformed[:, 1], c='blue', edgecolor='k')
plt.title("UMAP Transformation of Tabular Dataset (Databricks)")
plt.xlabel("Component 1")
plt.ylabel("Component 2")
plt.grid(True)
plt.show()
