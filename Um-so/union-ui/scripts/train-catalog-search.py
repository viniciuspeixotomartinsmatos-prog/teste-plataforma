"""Build a local latent semantic index from public/data/catalog-live.json.

Run from the app directory with numpy and scikit-learn installed.
Only the generated model is used by the browser.
"""
import base64
import json
from pathlib import Path
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize

directory = Path("public/data")
rows = json.loads((directory / "catalog-live.json").read_text(encoding="utf8"))
# Icon families have their own explorer. Near-identical icon descriptions must
# not dominate the semantic space used for components and page sections.
rows = [row for row in rows if row.get("kind") != "icon"]
documents = [" ".join([row["name"]] * 3 + [row.get("description", ""), row["category"], *row.get("tags", [])]) for row in rows]
vectorizer = TfidfVectorizer(strip_accents="unicode", stop_words="english", min_df=2, max_features=6000)
matrix = vectorizer.fit_transform(documents)
model = TruncatedSVD(n_components=64, random_state=42)
vectors = normalize(model.fit_transform(matrix))
def encode(array):
    return base64.b64encode(np.clip(array, -127, 127).round().astype(np.int8).tobytes()).decode("ascii")
word_vectors = model.components_.T * vectorizer.idf_[:,None]
index = dict(size=64, words=vectorizer.get_feature_names_out().tolist(), ids=[r["id"] for r in rows],
             queries=encode(word_vectors * (127 / np.abs(word_vectors).max())), documents=encode(vectors * 127))
(directory / "semantic-index.json").write_text(json.dumps(index,separators=(",",":")),encoding="utf8")
