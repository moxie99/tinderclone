import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import React, { Component, ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

// Advanced error boundary with recovery mechanisms
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to crash reporting service (e.g., Sentry, Bugsnag)
    this.logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && resetKeys.length > 0) {
        this.resetErrorBoundary();
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: any) => {
    // In a real app, you would send this to your crash reporting service
    console.log('Error logged to crash reporting service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }, 100);
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (error) {
      Alert.alert(
        'Error Report',
        `Error: ${error.message}\n\nThis error has been logged and will be reviewed.`,
        [{ text: 'OK' }]
      );
    }
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ThemedView style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <ThemedText style={styles.errorTitle}>
              Oops! Something went wrong
            </ThemedText>
            
            <ThemedText style={styles.errorMessage}>
              We're sorry, but something unexpected happened. 
              Don't worry, we're working to fix it.
            </ThemedText>

            {__DEV__ && error && (
              <View style={styles.errorDetails}>
                <ThemedText style={styles.errorDetailsTitle}>
                  Error Details (Development):
                </ThemedText>
                <ThemedText style={styles.errorDetailsText}>
                  {error.message}
                </ThemedText>
                {error.stack && (
                  <ThemedText style={styles.errorStack}>
                    {error.stack}
                  </ThemedText>
                )}
              </View>
            )}

            <View style={styles.errorActions}>
              <ThemedView style={styles.retryButton}>
                <ThemedText 
                  style={styles.retryButtonText}
                  onPress={this.handleRetry}
                >
                  Try Again
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.reportButton}>
                <ThemedText 
                  style={styles.reportButtonText}
                  onPress={this.handleReportError}
                >
                  Report Issue
                </ThemedText>
              </ThemedView>
            </View>
          </View>
        </ThemedView>
      );
    }

    return children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for programmatic error boundary control
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.light.text,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    color: Colors.light.text,
    opacity: 0.8,
  },
  errorDetails: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.light.text,
  },
  errorDetailsText: {
    fontSize: 12,
    color: Colors.light.text,
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 10,
    color: Colors.light.text,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportButtonText: {
    color: Colors.light.tint,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
