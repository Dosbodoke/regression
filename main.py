import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import shapiro, f_oneway


def get_normalized_data():
    # Carrega os dados
    df = pd.read_excel("output.xlsx", header=None)

    # Extrai as colunas B a M (que correspondem às colunas 1 a 12 na indexação zero-based)
    columns_b_to_m = df.iloc[:, 1:13]

    # Converte o DataFrame para um array bidimensional (lista de listas)
    array_2d = columns_b_to_m.values.tolist()

    # Achata o array bidimensional para uma série temporal única
    flattened_data = np.array(array_2d).flatten()

    return flattened_data, columns_b_to_m.values


def calculate_harmonic_components(precipitation_data):
    # Converting the data into a numpy array
    data = np.array(precipitation_data)

    # Number of data points (months)
    N = len(data)

    # Perform the Fourier transform
    fft_result = np.fft.fft(data)

    # Frequencies
    frequencies = np.fft.fftfreq(N)

    # Amplitudes and phases
    amplitudes = np.abs(fft_result)
    phases = np.angle(fft_result)

    # Only the first half of the frequencies are needed (positive frequencies)
    half_N = N // 2
    frequencies = frequencies[:half_N]
    amplitudes = amplitudes[:half_N]
    phases = phases[:half_N]

    return frequencies, amplitudes, phases


def perform_normality_test(data):
    # Realizar o teste de Shapiro-Wilk
    stat, p = shapiro(data)
    print('Shapiro-Wilk Test:')
    print('Statistic=%.3f, p-value=%.3f' % (stat, p))

    # Interpretação do p-valor
    alpha = 0.05
    if p > alpha:
        print('Sample looks Gaussian (fail to reject H0)')
    else:
        print('Sample does not look Gaussian (reject H0)')


def perform_anova(data_by_year):
    # Realizar a ANOVA de um fator
    anova_result = f_oneway(*data_by_year)
    print('ANOVA Result:')
    print('Statistic=%.3f, p-value=%.3f' % (anova_result.statistic, anova_result.pvalue))

    # Interpretação do p-valor
    alpha = 0.05
    if anova_result.pvalue < alpha:
        print('At least one group mean is different (reject H0)')
    else:
        print('All group means are equal (fail to reject H0)')


def main():
    data, data_by_year = get_normalized_data()

    # Teste de Normalidade
    perform_normality_test(data)

    # Análise de Variância (ANOVA)
    perform_anova(data_by_year)

    # Extrai componentes harmônicos
    frequencies, amplitudes, phases = calculate_harmonic_components(data)

    # Print the results
    print("Frequencies:", frequencies)
    print("Amplitudes:", amplitudes)
    print("Phases:", phases)

    # Plot the results
    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.stem(frequencies, amplitudes)
    plt.title("Amplitudes of Harmonics")
    plt.xlabel("Frequency (cycles per month)")
    plt.ylabel("Amplitude")

    plt.subplot(1, 2, 2)
    plt.stem(frequencies, phases)
    plt.title("Phases of Harmonics")
    plt.xlabel("Frequency (cycles per month)")
    plt.ylabel("Phase (radians)")

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
