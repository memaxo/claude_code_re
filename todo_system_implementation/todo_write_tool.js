const { saveTodos } = require('./file_manager');
const { todoWriteInputSchema } = require('./schema');

// From CODE_ANALYSIS.md
const todoToolPrompt = `Use this tool to update your to-do list for the current session. This tool should be used proactively as often as possible to track progress,
    and to ensure that any new tasks or ideas are captured appropriately. Err towards using this tool more often than less, especially in the following situations:
    - Immediately after a user message, to capture any new tasks or update existing tasks
    - Immediately after a task is completed, so that you can mark it as completed and create any new tasks that have emerged from the current task
    - Add todos for your own planned actions
    - Update todos as you make progress
    - Mark todos as in_progress when you start working on them. Ideally you should only have one todo as in_progress at a time. Complete existing tasks before starting new ones.
    - Mark todos as completed when finished
    - Cancel todos that are no longer relevant
    
    Being proactive with todo management helps you stay organized and ensures you don't forget important tasks. Adding todos demonstrates attentiveness and thoroughness.
    It is critical that you mark todos as completed as soon as you are done with a task. Do not batch up multiple tasks before marking them as completed.
    `;
const todoToolDescription = "Update the todo list for the current session. To be used proactively and often to track progress and pending tasks.";

// Simulates ZD
const TodoWriteTool = {
    name: "TodoWrite",
    async description() {
        // In the original, this might involve telemetry or dynamic elements
        return todoToolDescription;
    },
    async prompt() {
        // In the original, this likely returns a UI component reference (like aj2)
        // For this simulation, we just return the descriptive prompt text
        return todoToolPrompt;
    },
    inputSchema: todoWriteInputSchema,
    userFacingName() {
        // This could be dynamic in the original based on context
        return "Update TODO List";
    },
    async isEnabled() {
        // Original might have conditions (e.g., feature flags)
        return true;
    },
    // Note: Original CLI likely has permission checking (checkPermissions)
    // and more complex input validation (validateInput) which are omitted here for simplicity.

    // Simulates the core logic of the original call method
    async *call(input) {
        // 1. Validate Input
        const validationResult = this.inputSchema.validate(input);

        let resultMessage;
        let resultData;

        if (!validationResult.success) {
            // Handle validation failure
            resultMessage = `Input validation failed: ${validationResult.errors.join(', ')}`;
            resultData = {
                success: false,
                message: resultMessage,
            };
            // Yield an error result (mimicking tool_result with is_error: true)
            yield {
                type: "result",
                data: this.renderToolResultMessage(resultData),
            };
            return; // Stop processing on validation error
        }

        // 2. Perform the Action (Save Todos)
        try {
            // Assuming input is valid, extract the todos list
            const todosToSave = input.todos;
            const saveResult = saveTodos(todosToSave); // Call the file manager function

            // Prepare result based on save outcome
            resultData = { ...saveResult }; // Copy success and message from saveResult

        } catch (error) {
            // Handle unexpected errors during saving
            console.error("Unexpected error during TodoWriteTool call:", error);
            resultMessage = `Internal tool error: ${error.message}`;
            resultData = {
                success: false,
                message: resultMessage,
            };
        }

        // 3. Yield the Result
        yield {
            type: "result",
            data: this.renderToolResultMessage(resultData),
        };
    },

    renderResultForAssistant(resultData) {
        // Simple text summary for the LLM
        return resultData.success
            ? `Successfully updated the TODO list.`
            : `Failed to update TODO list: ${resultData.message}`;
    },

    renderToolResultMessage(resultData) {
        // Structured result for potential UI rendering or further processing
        // In the original, this might involve React components (like TodoItemRenderer)
        return {
            // tool_use_id: context.toolUseId, // Would need context passed in
            is_error: !resultData.success,
            success: resultData.success,
            message: resultData.message,
            // content: resultData.success ? "TODO list updated." : resultData.message, // Simplified content
            // Optionally include the saved todos or a diff here
        };
    },
};

module.exports = { TodoWriteTool }; 