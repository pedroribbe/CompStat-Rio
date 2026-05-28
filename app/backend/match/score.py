"""Pontuação do match ("bingo") de um segmento crítico.

Função PURA (sem I/O): combina sinais já normalizados/booleanos numa nota 0–10.

----------------------------------------------------------------------------
Pesos da fórmula (ajustáveis em um único lugar)
----------------------------------------------------------------------------
Cada componente entra como contribuição linear positiva. O resultado é
limitado em 10 (`NOTA_MAXIMA`). Os valores atuais foram escolhidos à mão e
podem ser revistos com o cliente — alterar aqui basta para refletir em todo
o sistema. Os números espelhados no frontend (Seção 10) devem ser mantidos
em sincronia.

  - PESO_DENSIDADE:      peso da MANCHA criminal (densidade de ocorrências
                         da célula, já normalizada entre 0 e 1). É o sinal
                         "duro" — quanto mais crime registrado por área,
                         maior o peso.
  - PESO_FATOR:          peso do FATOR URBANO no raio (booleano). Vale
                         quando existe uma causa removível mapeada
                         (iluminação, poda, calçada etc.).
  - PESO_DINAMICA:       peso da DINÂMICA criminal estruturada (booleano):
                         há indícios qualitativos (RELINT/Disque) na área.
                         Texto livre é indício, não fato — daí o peso mais
                         baixo.
  - PESO_LACUNA_CAMERA:  peso da AUSÊNCIA de câmera no raio (booleano).
                         Lacuna de cobertura agrava o segmento.
"""
from __future__ import annotations


PESO_DENSIDADE: float = 5.0
PESO_FATOR: float = 2.0
PESO_DINAMICA: float = 1.5
PESO_LACUNA_CAMERA: float = 1.5
NOTA_MAXIMA: float = 10.0


def score(
    densidade_norm: float,
    tem_fator: bool,
    tem_dinamica: bool,
    lacuna_camera: bool,
) -> float:
    """Nota 0–10 de um segmento crítico.

    Fórmula:
        min(NOTA_MAXIMA,
            PESO_DENSIDADE * densidade_norm
            + PESO_FATOR        * tem_fator
            + PESO_DINAMICA     * tem_dinamica
            + PESO_LACUNA_CAMERA * lacuna_camera)

    - densidade_norm: densidade de ocorrências da célula / densidade máxima (0..1).
    - tem_fator: há fator urbano (causa removível) no raio.
    - tem_dinamica: há dinâmica criminal estruturada (RELINT/Disque) para a área.
    - lacuna_camera: não há câmera no raio (cobertura ausente).
    """
    nota = (
        PESO_DENSIDADE * float(densidade_norm)
        + PESO_FATOR * (1.0 if tem_fator else 0.0)
        + PESO_DINAMICA * (1.0 if tem_dinamica else 0.0)
        + PESO_LACUNA_CAMERA * (1.0 if lacuna_camera else 0.0)
    )
    return min(NOTA_MAXIMA, nota)
