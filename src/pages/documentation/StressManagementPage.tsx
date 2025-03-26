
import React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const StressManagementPage = () => {
  return (
    <PageLayout
      title="Dealing with Stress"
      description="Ancient wisdom for managing modern anxiety and stress"
    >
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-8">
          <Link to="/documentation" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Documentation
          </Link>
        </Button>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>Modern Stress and Ancient Solutions</h2>
        <p>
          In today's fast-paced world, stress and anxiety have become nearly universal experiences. The Bhagavad Gita, though composed thousands of years ago, offers remarkably relevant insights for managing these modern afflictions.
        </p>

        <h2>Understanding Stress from the Gita's Perspective</h2>
        <p>
          According to the Bhagavad Gita, stress and anxiety primarily arise from:
        </p>
        <ul>
          <li>Attachment to outcomes</li>
          <li>Dwelling on past regrets and future worries</li>
          <li>Misidentification with the temporary (body, possessions, status)</li>
          <li>Lack of clarity about one's purpose (dharma)</li>
        </ul>

        <p>
          Krishna tells Arjuna: "From attachment springs desire, and from desire comes anger. From anger arises delusion; from delusion, confusion of memory; from confusion of memory, loss of reason; and from loss of reason, utter ruin." (2.62-63)
        </p>

        <h2>Practical Teachings for Stress Management</h2>
        
        <h3>1. Practice Detachment from Results</h3>
        <p>
          The Gita's famous teaching—"You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions" (2.47)—provides a powerful antidote to the stress that comes from outcome fixation. By focusing on the process rather than the result, we free ourselves from anxiety about success or failure.
        </p>
        
        <h3>2. Stay Present-Centered</h3>
        <p>
          The Gita teaches the value of present-moment awareness: "The wise neither grieve for the dead nor for the living" (2.11). By directing our attention to the present rather than ruminating on the past or worrying about the future, we can significantly reduce stress.
        </p>
        
        <h3>3. Adopt a Higher Perspective</h3>
        <p>
          Understanding our eternal nature beyond the body provides perspective during challenging times: "For the soul there is never birth nor death. It is not that it once was not and will never be again. It is unborn, eternal, ever-existing, undying, and primeval." (2.20)
        </p>
        
        <h3>4. Practice Meditation</h3>
        <p>
          The Gita offers specific instructions for meditation practice: "One should hold one's body, head, and neck erect, immovably steady, looking at the tip of one's nose, without looking around." (6.13)
        </p>
        <p>
          Regular meditation has been scientifically proven to reduce stress and anxiety, improve concentration, and promote emotional health—benefits the ancient text recognized millennia ago.
        </p>
        
        <h3>5. Cultivate Equanimity</h3>
        <p>
          The Gita describes the ideal state of mind as "balanced in pleasure and pain, self-reliant, to whom a clod of dirt, a stone, and gold are alike." (14.24) This equanimity—remaining even-minded in all circumstances—is both a practice and a goal for stress reduction.
        </p>

        <h2>Modern Applications of Gita Wisdom</h2>
        <p>
          These ancient teachings can be applied to contemporary stress triggers:
        </p>
        
        <h3>Work Stress</h3>
        <p>
          Apply karma yoga by focusing on excellence in your work rather than recognition or rewards. Set boundaries between work and personal life to maintain balance.
        </p>
        
        <h3>Relationship Anxiety</h3>
        <p>
          Practice seeing the divine in others and approach relationships with less attachment to outcomes. Cultivate understanding rather than expectation.
        </p>
        
        <h3>Financial Worries</h3>
        <p>
          Remember that material possessions are temporary. Focus on needs versus wants and practice gratitude for what you have rather than anxiety about what you lack.
        </p>
        
        <h3>Health Concerns</h3>
        <p>
          Balance practical care for the body with the understanding that the body is temporary while the self is eternal. This perspective can reduce health-related anxiety.
        </p>

        <h2>Daily Practices</h2>
        <p>
          Incorporate these Gita-inspired practices into your daily routine:
        </p>
        <ul>
          <li><strong>Morning meditation:</strong> Even 10-15 minutes can set a calm tone for the day</li>
          <li><strong>Conscious breathing:</strong> Take regular breath breaks throughout the day</li>
          <li><strong>Evening reflection:</strong> Review your day from a detached perspective</li>
          <li><strong>Bedtime reading:</strong> Read a verse from the Gita before sleep for contemplation</li>
          <li><strong>Service attitude:</strong> Approach work and relationships as opportunities for service rather than personal gain</li>
        </ul>

        <h2>Conclusion</h2>
        <p>
          The Bhagavad Gita's wisdom offers a comprehensive approach to stress management that addresses both external circumstances and internal reactions. By incorporating these teachings into daily life, we can develop resilience against stress and anxiety while cultivating inner peace that remains steady regardless of external conditions.
        </p>
      </div>
    </PageLayout>
  );
};

export default StressManagementPage;
