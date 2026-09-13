import { Router } from 'express';
import { GeminiService } from '../services/geminiService';
import { ContextEngine } from '../services/contextEngine';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { prompt, activeFile, selectedCode, openFiles, terminalErrors } = req.body;
    const context = ContextEngine.gatherContext({ activeFile, selectedCode, openFiles, terminalErrors, userPrompt: prompt });
    const reply = await GeminiService.generateResponse(prompt, context);
    res.json({ success: true, message: reply });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/plan', async (req, res) => {
  try {
    const { prompt } = req.body;
    const planSteps = [
      'Analyze project specifications',
      'Create UI components and routing structure',
      'Configure database tables and API services',
      'Run verification suite and launch live preview'
    ];
    res.json({ success: true, plan: planSteps });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/debug', async (req, res) => {
  try {
    const { errorDetails, fileContent } = req.body;
    res.json({
      success: true,
      diagnostic: 'Type mismatch detected',
      suggestedFix: 'Update type definition to match Promise return signature.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
