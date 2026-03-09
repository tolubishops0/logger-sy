import { Component, type ReactNode } from "react";
import { logger } from "~/lib/logger";

interface Props {
    children: ReactNode;
    section: string;
    onReset?: () => void;
}

interface State {
    crashed: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { crashed: false, error: null };
    }

    componentDidCatch(error: Error) {
        logger.error(`Error boundary caught crash in ${this.props.section}`, {
            error: error.message,
            section: this.props.section,
        });
        this.setState({ crashed: true, error });
    }

    reset = () => {
        this.setState({ crashed: false, error: null });
        this.props.onReset?.();
    };
    render() {
        if (this.state.crashed) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                    <span className="text-red-400 text-2xl">⚠</span>
                    <p className="text-red-400 text-xs font-mono">
                        {this.props.section} crashed
                    </p>
                    <p className="text-zinc-600 text-xs font-mono">
                        {this.state.error?.message}
                    </p>
                    <button
                        onClick={this.reset}
                        className="mt-2 text-xs font-mono border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 px-4 py-2 rounded transition-colors"
                    >
                        reset
                    </button>
                </div>
            );
        }
        console.log(this.props.section);

        return this.props.children;
    }
}