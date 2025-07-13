import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.gridspec import GridSpec
from datetime import datetime, timedelta
import random

# Set random seed for reproducibility
np.random.seed(42)

# Generate sample data
def generate_sample_data(days=200):
    # Create date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    date_range = pd.date_range(start=start_date, end=end_date, freq='B')  # Business days
    
    # Generate price data with a somewhat realistic pattern
    close = 100  # Starting price
    prices = []
    for _ in range(len(date_range)):
        # Random daily change with slight upward bias
        change = np.random.normal(0.05, 1.0)  # Mean 0.05%, std 1%
        close *= (1 + change/100)
        prices.append(close)
    
    # Create price series
    close_prices = np.array(prices)
    
    # Generate high, low, open with realistic relationships to close
    high_prices = close_prices * (1 + abs(np.random.normal(0, 0.01, len(close_prices))))
    low_prices = close_prices * (1 - abs(np.random.normal(0, 0.01, len(close_prices))))
    open_prices = low_prices + (high_prices - low_prices) * np.random.random(len(close_prices))
    
    # Generate volume with occasional spikes
    volume = np.random.normal(1000000, 200000, len(close_prices))
    volume = np.where(np.random.random(len(close_prices)) > 0.95, 
                      volume * np.random.uniform(2, 3, len(close_prices)), 
                      volume)
    
    # Create DataFrame
    df = pd.DataFrame({
        'open': open_prices,
        'high': high_prices,
        'low': low_prices,
        'close': close_prices,
        'volume': volume
    }, index=date_range)
    
    return df

# Calculate all technical indicators
def calculate_indicators(df):
    # Simple Moving Averages
    for period in [5, 10, 20, 50, 200]:
        df[f'sma_{period}'] = df['close'].rolling(window=period).mean()
    
    # Exponential Moving Averages
    for period in [5, 10, 20, 50, 200, 12, 26]:
        df[f'ema_{period}'] = df['close'].ewm(span=period, adjust=False).mean()
    
    # MACD
    df['macd'] = df['ema_12'] - df['ema_26']
    df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
    df['macd_hist'] = df['macd'] - df['macd_signal']
    
    # RSI
    delta = df['close'].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=14).mean()
    avg_loss = loss.rolling(window=14).mean()
    rs = avg_gain / avg_loss
    df['rsi'] = 100 - (100 / (1 + rs))
    
    # Bollinger Bands
    df['bollinger_mid'] = df['sma_20']
    df['bollinger_std'] = df['close'].rolling(window=20).std()
    df['bollinger_upper'] = df['bollinger_mid'] + 2 * df['bollinger_std']
    df['bollinger_lower'] = df['bollinger_mid'] - 2 * df['bollinger_std']
    
    # True Range and ATR
    df['tr'] = np.maximum(
        df['high'] - df['low'],
        np.maximum(
            abs(df['high'] - df['close'].shift(1)),
            abs(df['low'] - df['close'].shift(1))
        )
    )
    df['atr'] = df['tr'].rolling(window=14).mean()
    
    # Momentum and Rate of Change
    df['momentum'] = df['close'] - df['close'].shift(10)
    df['roc'] = (df['close'] / df['close'].shift(10) - 1) * 100
    
    # Volume SMA
    df['volume_sma'] = df['volume'].rolling(window=20).mean()
    
    # Price to SMA ratios
    df['price_to_sma_20'] = df['close'] / df['sma_20']
    df['price_to_sma_50'] = df['close'] / df['sma_50']
    
    # SMA crosses
    df['sma_20_50_cross'] = ((df['sma_20'] > df['sma_50']) & 
                             (df['sma_20'].shift(1) <= df['sma_50'].shift(1))).astype(int) - \
                            ((df['sma_20'] < df['sma_50']) & 
                             (df['sma_20'].shift(1) >= df['sma_50'].shift(1))).astype(int)
    
    # Volatility (standard deviation of returns)
    df['volatility'] = df['close'].pct_change().rolling(window=20).std() * 100
    
    # Distance from high/low
    df['dist_from_high_20'] = (df['close'] / df['high'].rolling(window=20).max() - 1) * 100
    df['dist_from_low_20'] = (df['close'] / df['low'].rolling(window=20).min() - 1) * 100
    
    return df

# Create and plot the data
df = generate_sample_data(days=200)
df = calculate_indicators(df)

# Drop NaN values for plotting
df = df.dropna()

# Create a comprehensive visualization
plt.style.use('fivethirtyeight')
plt.rcParams['figure.figsize'] = (14, 18)

# Create GridSpec for layout
fig = plt.figure(constrained_layout=True)
gs = GridSpec(6, 1, figure=fig, height_ratios=[3, 1, 1, 1, 1, 1])

# 1. Price and Moving Averages
ax1 = fig.add_subplot(gs[0])
ax1.plot(df.index, df['close'], label='Close', linewidth=2, color='black')
ax1.plot(df.index, df['sma_20'], label='SMA 20', linewidth=1.5, alpha=0.8)
ax1.plot(df.index, df['sma_50'], label='SMA 50', linewidth=1.5, alpha=0.8)
ax1.plot(df.index, df['sma_200'], label='SMA 200', linewidth=1.5, alpha=0.8)
ax1.fill_between(df.index, df['bollinger_upper'], df['bollinger_lower'], color='gray', alpha=0.2, label='Bollinger Bands')
ax1.set_title('Price with Moving Averages and Bollinger Bands')
ax1.legend(loc='upper left')
ax1.grid(True, alpha=0.3)

# 2. Volume
ax2 = fig.add_subplot(gs[1], sharex=ax1)
ax2.bar(df.index, df['volume'], color='blue', alpha=0.5, label='Volume')
ax2.plot(df.index, df['volume_sma'], color='red', label='Volume SMA 20')
ax2.set_title('Volume')
ax2.legend(loc='upper left')
ax2.grid(True, alpha=0.3)

# 3. MACD
ax3 = fig.add_subplot(gs[2], sharex=ax1)
ax3.plot(df.index, df['macd'], label='MACD', color='blue')
ax3.plot(df.index, df['macd_signal'], label='Signal', color='red')
ax3.bar(df.index, df['macd_hist'], label='Histogram', color='green', alpha=0.5)
ax3.axhline(y=0, color='black', linestyle='-', alpha=0.3)
ax3.set_title('MACD')
ax3.legend(loc='upper left')
ax3.grid(True, alpha=0.3)

# 4. RSI
ax4 = fig.add_subplot(gs[3], sharex=ax1)
ax4.plot(df.index, df['rsi'], label='RSI', color='purple')
ax4.axhline(y=70, color='red', linestyle='--', alpha=0.5)
ax4.axhline(y=30, color='green', linestyle='--', alpha=0.5)
ax4.set_ylim(0, 100)
ax4.set_title('RSI')
ax4.legend(loc='upper left')
ax4.grid(True, alpha=0.3)

# 5. ATR and Volatility
ax5 = fig.add_subplot(gs[4], sharex=ax1)
ax5.plot(df.index, df['atr'], label='ATR', color='orange')
ax5.plot(df.index, df['volatility'], label='Volatility', color='red', alpha=0.7)
ax5.set_title('ATR and Volatility')
ax5.legend(loc='upper left')
ax5.grid(True, alpha=0.3)

# 6. Price to SMA Ratios and Distance from High/Low
ax6 = fig.add_subplot(gs[5], sharex=ax1)
ax6.plot(df.index, df['price_to_sma_20'], label='Price/SMA20', color='blue')
ax6.plot(df.index, df['price_to_sma_50'], label='Price/SMA50', color='green')
ax6.plot(df.index, df['dist_from_high_20'], label='Dist from 20d High', color='red', alpha=0.7)
ax6.plot(df.index, df['dist_from_low_20'], label='Dist from 20d Low', color='purple', alpha=0.7)
ax6.axhline(y=1, color='black', linestyle='--', alpha=0.3)
ax6.set_title('Price Ratios and Distance Metrics')
ax6.legend(loc='upper left')
ax6.grid(True, alpha=0.3)

# Format x-axis dates
for ax in [ax1, ax2, ax3, ax4, ax5, ax6]:
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=4))
    plt.setp(ax.xaxis.get_majorticklabels(), rotation=45)

plt.tight_layout()
plt.show()

# Print a sample of the data
print("Sample of the generated data with indicators:")
print(df.iloc[-5:, :7])  # Show last 5 rows, first 7 columns
print("\nAdditional indicators (sample):")
print(df.iloc[-1, 7:].to_dict())
