
import React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const IntroToGitaPage = () => {
  return (
    <PageLayout
      title="Introduction to Bhagavad Gita"
      description="Learn about the historical context and significance of the Bhagavad Gita"
    >
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-8">
          <Link to="/documentation" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Documentation
          </Link>
        </Button>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>Historical Context</h2>
        <p>
          The Bhagavad Gita, often referred to as the Gita, is a 700-verse Sanskrit scripture that is part of the Hindu epic Mahabharata. It is a sacred philosophical text of the Hindus that records the conversation between Arjuna, a warrior prince, and Lord Krishna, his charioteer and an avatar of Lord Vishnu, on the battlefield of Kurukshetra just before the start of the Mahabharata war.
        </p>
        
        <p>
          Composed between the 5th and 2nd century BCE, the Bhagavad Gita represents a summary of the Upanishadic teachings and can be seen as a practical guide to living a spiritual life. The dialogue covers a broad range of spiritual topics, touching upon ethical dilemmas and philosophical issues that go far beyond the war Arjuna faces.
        </p>

        <h2>The Setting</h2>
        <p>
          The narrative takes place on the battlefield of Kurukshetra, where two groups of cousins, the Kauravas and the Pandavas, are about to engage in a war over succession to the throne of Hastinapura. Arjuna, one of the five Pandava brothers, is filled with doubt on the battlefield. As he sees his relatives, beloved teachers, and friends on the opposing army, he questions the righteousness of fighting against his own people and is overcome with ethical and moral dilemmas.
        </p>

        <p>
          It is at this moment of crisis that Lord Krishna, who has agreed to be Arjuna's charioteer in the battle, begins to instruct Arjuna on various aspects of dharma (duty), karma (action), bhakti (devotion), jnana (knowledge), and yoga, leading him to the understanding that fighting the battle is his moral duty (dharma).
        </p>

        <h2>Central Themes</h2>
        <h3>Dharma (Duty/Righteousness)</h3>
        <p>
          One of the central teachings of the Bhagavad Gita is the concept of dharma or righteous duty. Krishna emphasizes to Arjuna that performing one's duty without attachment to the fruits of actions is the path to spiritual liberation. For Arjuna, as a warrior (Kshatriya), his dharma is to fight a righteous war.
        </p>

        <h3>Karma Yoga (Path of Action)</h3>
        <p>
          The Gita introduces the concept of Karma Yoga or the discipline of action. Krishna advises Arjuna to perform his actions without being attached to their fruits, without being swayed by pleasure or pain, success or failure. This selfless action, performed with a balanced mind, leads to liberation.
        </p>

        <h3>Bhakti Yoga (Path of Devotion)</h3>
        <p>
          The Gita also emphasizes the importance of devotion to God. Krishna teaches that through unwavering devotion and surrender to the divine, one can attain spiritual realization and liberation.
        </p>

        <h3>Jnana Yoga (Path of Knowledge)</h3>
        <p>
          Another path highlighted in the Gita is the path of knowledge, which involves understanding the nature of the self (Atman) and its relationship with the ultimate reality (Brahman). This knowledge leads to the realization that the true self is eternal and distinct from the physical body.
        </p>

        <h2>Significance</h2>
        <p>
          The Bhagavad Gita has been highly influential and inspirational to many great thinkers and leaders worldwide. It has been translated into numerous languages and has been a source of inspiration for people like Mahatma Gandhi, Albert Einstein, J. Robert Oppenheimer, Ralph Waldo Emerson, Carl Jung, and many others.
        </p>

        <p>
          The significance of the Bhagavad Gita extends beyond religious boundaries. Its universal message of selfless action, devotion, and the pursuit of knowledge makes it a philosophical guide for humanity regardless of religious affiliations.
        </p>

        <h2>Conclusion</h2>
        <p>
          The Bhagavad Gita stands as a timeless guide to understanding the purpose of life, the nature of reality, and the path to spiritual liberation. Its teachings continue to be relevant in today's complex world, offering insights into dealing with ethical dilemmas, stress, anxiety, and the search for meaning in life.
        </p>
      </div>
    </PageLayout>
  );
};

export default IntroToGitaPage;
