import pandas as pd
from supabase import create_client, Client
import os

# 1. Configurações do Supabase (Substitua com suas chaves se necessário)
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "SUA_URL_DO_SUPABASE")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "SUA_CHAVE_ANON_DO_SUPABASE")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def importar_estoque():
    df = pd.read_csv("produtos_pharmagno_corrigido.csv")
    registros = df.to_dict(orient="records")
    
    print(f"Iniciando atualização de {len(registros)} produtos no Supabase...")
    
    # Enviar em lotes de 100 produtos para evitar timeout
    batch_size = 100
    for i in range(0, len(registros), batch_size):
        lote = registros[i:i + batch_size]
        response = supabase.from_("produtos_pharmagno").upsert(lote).execute()
        print(f"Processado: {i + len(lote)} / {len(registros)}")
        
    print("Atualização concluída com sucesso!")

if __name__ == "__main__":
    importar_estoque()
