export default {
  "test-gpt": {
    "state": {
      "ok": true,
      "revision": 0,
      "settings": {
        "frequency": {
          "mode": "start"
        },
        "completedTurns": 2,
        "startEligible": false
      },
      "sessionId": "demo-test-gpt",
      "record": {
        "id": "demo-test-gpt-current",
        "sessionId": "demo-test-gpt",
        "requestModel": "gpt-6.1-sol",
        "provider": "test-gpt",
        "reasoningEffort": "high",
        "responseModel": "gpt-6.1-sol",
        "responseField": "wire.responses.model",
        "startedAt": 1791864000000,
        "endedAt": 1791864003600,
        "latencyMs": 3600,
        "outcome": "complete",
        "fingerprint": {
          "prediction": "gpt-6.1-sol",
          "probability": 0.963,
          "usedOutputs": 3,
          "sampledAt": 1791864003600,
          "requestedInBank": true,
          "requestedProbability": 0.963,
          "sampleMode": "independent",
          "requestRecordId": "demo-test-gpt-current",
          "candidates": [
            {
              "model": "gpt-6.1-sol",
              "probability": 0.963
            },
            {
              "model": "gpt-6-sol",
              "probability": 0.029
            },
            {
              "model": "gpt-6-astra",
              "probability": 0.008
            }
          ]
        },
        "check": {
          "state": "complete",
          "completed": 4,
          "total": 4,
          "valid": 3,
          "traceCompleted": 3,
          "traceState": "complete",
          "durationMs": 3400,
          "usage": {
            "inputTokens": 450,
            "outputTokens": 1250
          }
        },
        "turn": 2,
        "evaluations": {
          "candy": {
            "state": "complete",
            "completed": 1,
            "total": 1,
            "valid": 1,
            "errors": 0,
            "hits": 1,
            "graded": 1,
            "endedAt": 1791864003600,
            "durationMs": 3200,
            "reasoningEffort": "high",
            "artifactAvailable": true
          }
        },
        "behaviorUnavailableReason": null
      },
      "history": [
        {
          "id": "demo-test-gpt-current",
          "sessionId": "demo-test-gpt",
          "requestModel": "gpt-6.1-sol",
          "provider": "test-gpt",
          "reasoningEffort": "high",
          "responseModel": "gpt-6.1-sol",
          "responseField": "wire.responses.model",
          "startedAt": 1791864000000,
          "endedAt": 1791864003600,
          "latencyMs": 3600,
          "outcome": "complete",
          "fingerprint": {
            "prediction": "gpt-6.1-sol",
            "probability": 0.963,
            "usedOutputs": 3,
            "sampledAt": 1791864003600,
            "requestedInBank": true,
            "requestedProbability": 0.963,
            "sampleMode": "independent",
            "requestRecordId": "demo-test-gpt-current",
            "candidates": [
              {
                "model": "gpt-6.1-sol",
                "probability": 0.963
              },
              {
                "model": "gpt-6-sol",
                "probability": 0.029
              },
              {
                "model": "gpt-6-astra",
                "probability": 0.008
              }
            ]
          },
          "check": {
            "state": "complete",
            "completed": 4,
            "total": 4,
            "valid": 3,
            "traceCompleted": 3,
            "traceState": "complete",
            "durationMs": 3400,
            "usage": {
              "inputTokens": 450,
              "outputTokens": 1250
            }
          },
          "turn": 2,
          "evaluations": {
            "candy": {
              "state": "complete",
              "completed": 1,
              "total": 1,
              "valid": 1,
              "errors": 0,
              "hits": 1,
              "graded": 1,
              "endedAt": 1791864003600,
              "durationMs": 3200,
              "reasoningEffort": "high",
              "artifactAvailable": true
            }
          },
          "behaviorUnavailableReason": null
        },
        {
          "id": "demo-test-gpt-previous",
          "sessionId": "demo-test-gpt",
          "requestModel": "gpt-6.1-sol",
          "provider": "test-gpt",
          "reasoningEffort": "high",
          "responseModel": null,
          "responseField": null,
          "startedAt": 1791863880000,
          "endedAt": 1791863883600,
          "latencyMs": 3600,
          "outcome": "complete",
          "fingerprint": {
            "prediction": "gpt-6.1-sol",
            "probability": 0.963,
            "usedOutputs": 3,
            "sampledAt": 1791864003600,
            "requestedInBank": true,
            "requestedProbability": 0.963,
            "sampleMode": "independent",
            "requestRecordId": "demo-test-gpt-previous",
            "candidates": [
              {
                "model": "gpt-6.1-sol",
                "probability": 0.963
              },
              {
                "model": "gpt-6-sol",
                "probability": 0.029
              },
              {
                "model": "gpt-6-astra",
                "probability": 0.008
              }
            ]
          },
          "check": {
            "state": "complete",
            "completed": 4,
            "total": 4,
            "valid": 3,
            "traceCompleted": 3,
            "traceState": "complete",
            "durationMs": 3400,
            "usage": {
              "inputTokens": 450,
              "outputTokens": 1250
            }
          },
          "turn": 1,
          "evaluations": {
            "candy": {
              "state": "complete",
              "completed": 1,
              "total": 1,
              "valid": 1,
              "errors": 0,
              "hits": 0,
              "graded": 1,
              "endedAt": 1791864003600,
              "durationMs": 3200,
              "reasoningEffort": "high",
              "artifactAvailable": true
            }
          },
          "behaviorUnavailableReason": null
        }
      ],
      "bank": {
        "source": "ModelTrace",
        "models": [
          "gpt-5.4",
          "gpt-5.5",
          "gpt-5.6-sol",
          "gpt-5.6-terra",
          "gpt-5.6-luna",
          "gpt-6-astra",
          "gpt-6-sol",
          "gpt-6-luna",
          "claude-haiku-4-5-20251001",
          "claude-sonnet-4-6",
          "claude-sonnet-5",
          "claude-opus-4-6",
          "claude-opus-4-7",
          "claude-opus-4-8",
          "claude-opus-5",
          "claude-opus-5-5",
          "claude-sonnet-5-5",
          "claude-haiku-5-5",
          "gpt-6.1-sol"
        ],
        "count": 19
      },
      "behaviorBank": {
        "source": "Candy Eval",
        "models": [
          "gpt-5.5",
          "gpt-5.6-luna",
          "gpt-5.6-sol",
          "gpt-5.6-terra",
          "gpt-6-astra",
          "gpt-6-luna",
          "gpt-6-sol",
          "gpt-6.1-sol"
        ],
        "count": 8,
        "probes": 16
      },
      "activeEvaluation": null,
      "storageWarning": false
    },
    "details": {
      "demo-test-gpt-current": {
        "candy": {
          "ok": true,
          "recordId": "demo-test-gpt-current",
          "kind": "candy",
          "result": {
            "state": "complete",
            "completed": 1,
            "total": 1,
            "valid": 1,
            "errors": 0,
            "hits": 1,
            "graded": 1,
            "endedAt": 1791864003600,
            "durationMs": 3200,
            "reasoningEffort": "high",
            "artifactAvailable": true
          },
          "payload": {
            "answers": [
              {
                "hit": true,
                "answer": "演示回答：21 个糖果。此文本仅用于展示命中与回答详情。",
                "error": null,
                "durationMs": 3200
              }
            ]
          }
        }
      },
      "demo-test-gpt-previous": {
        "candy": {
          "ok": true,
          "recordId": "demo-test-gpt-previous",
          "kind": "candy",
          "result": {
            "state": "complete",
            "completed": 1,
            "total": 1,
            "valid": 1,
            "errors": 0,
            "hits": 0,
            "graded": 1,
            "endedAt": 1791864003600,
            "durationMs": 3200,
            "reasoningEffort": "high",
            "artifactAvailable": true
          },
          "payload": {
            "answers": [
              {
                "hit": false,
                "answer": "演示回答：20 个糖果。",
                "error": null,
                "durationMs": 3100
              }
            ]
          }
        }
      }
    }
  },
  "test-Claude": {
    "state": {
      "ok": true,
      "revision": 0,
      "settings": {
        "frequency": {
          "mode": "start"
        },
        "completedTurns": 2,
        "startEligible": false
      },
      "sessionId": "demo-test-Claude",
      "record": {
        "id": "demo-test-Claude-current",
        "sessionId": "demo-test-Claude",
        "requestModel": "claude-sonnet-5-5",
        "provider": "test-Claude",
        "reasoningEffort": "high",
        "responseModel": "claude-sonnet-5-5",
        "responseField": "wire.responses.model",
        "startedAt": 1791864000000,
        "endedAt": 1791864003600,
        "latencyMs": 3600,
        "outcome": "complete",
        "fingerprint": {
          "prediction": "claude-sonnet-5-5",
          "probability": 0.809,
          "usedOutputs": 3,
          "sampledAt": 1791864003600,
          "requestedInBank": true,
          "requestedProbability": 0.809,
          "sampleMode": "independent",
          "requestRecordId": "demo-test-Claude-current",
          "candidates": [
            {
              "model": "claude-sonnet-5-5",
              "probability": 0.809
            },
            {
              "model": "claude-sonnet-5",
              "probability": 0.131
            },
            {
              "model": "claude-opus-5-5",
              "probability": 0.06
            }
          ]
        },
        "check": {
          "state": "complete",
          "completed": 4,
          "total": 4,
          "valid": 3,
          "traceCompleted": 3,
          "traceState": "complete",
          "durationMs": 3400,
          "usage": {
            "inputTokens": 450,
            "outputTokens": 1250
          }
        },
        "turn": 2,
        "evaluations": {
          "candy": {
            "state": "complete",
            "completed": 1,
            "total": 1,
            "valid": 1,
            "errors": 0,
            "hits": 1,
            "graded": 1,
            "endedAt": 1791864003600,
            "durationMs": 3200,
            "reasoningEffort": "high",
            "artifactAvailable": true
          }
        },
        "behaviorUnavailableReason": null
      },
      "history": [
        {
          "id": "demo-test-Claude-current",
          "sessionId": "demo-test-Claude",
          "requestModel": "claude-sonnet-5-5",
          "provider": "test-Claude",
          "reasoningEffort": "high",
          "responseModel": "claude-sonnet-5-5",
          "responseField": "wire.responses.model",
          "startedAt": 1791864000000,
          "endedAt": 1791864003600,
          "latencyMs": 3600,
          "outcome": "complete",
          "fingerprint": {
            "prediction": "claude-sonnet-5-5",
            "probability": 0.809,
            "usedOutputs": 3,
            "sampledAt": 1791864003600,
            "requestedInBank": true,
            "requestedProbability": 0.809,
            "sampleMode": "independent",
            "requestRecordId": "demo-test-Claude-current",
            "candidates": [
              {
                "model": "claude-sonnet-5-5",
                "probability": 0.809
              },
              {
                "model": "claude-sonnet-5",
                "probability": 0.131
              },
              {
                "model": "claude-opus-5-5",
                "probability": 0.06
              }
            ]
          },
          "check": {
            "state": "complete",
            "completed": 4,
            "total": 4,
            "valid": 3,
            "traceCompleted": 3,
            "traceState": "complete",
            "durationMs": 3400,
            "usage": {
              "inputTokens": 450,
              "outputTokens": 1250
            }
          },
          "turn": 2,
          "evaluations": {
            "candy": {
              "state": "complete",
              "completed": 1,
              "total": 1,
              "valid": 1,
              "errors": 0,
              "hits": 1,
              "graded": 1,
              "endedAt": 1791864003600,
              "durationMs": 3200,
              "reasoningEffort": "high",
              "artifactAvailable": true
            }
          },
          "behaviorUnavailableReason": null
        },
        {
          "id": "demo-test-Claude-previous",
          "sessionId": "demo-test-Claude",
          "requestModel": "claude-sonnet-5-5",
          "provider": "test-Claude",
          "reasoningEffort": "high",
          "responseModel": null,
          "responseField": null,
          "startedAt": 1791863880000,
          "endedAt": 1791863883600,
          "latencyMs": 3600,
          "outcome": "complete",
          "fingerprint": {
            "prediction": "claude-sonnet-5-5",
            "probability": 0.809,
            "usedOutputs": 3,
            "sampledAt": 1791864003600,
            "requestedInBank": true,
            "requestedProbability": 0.809,
            "sampleMode": "independent",
            "requestRecordId": "demo-test-Claude-previous",
            "candidates": [
              {
                "model": "claude-sonnet-5-5",
                "probability": 0.809
              },
              {
                "model": "claude-sonnet-5",
                "probability": 0.131
              },
              {
                "model": "claude-opus-5-5",
                "probability": 0.06
              }
            ]
          },
          "check": {
            "state": "complete",
            "completed": 4,
            "total": 4,
            "valid": 3,
            "traceCompleted": 3,
            "traceState": "complete",
            "durationMs": 3400,
            "usage": {
              "inputTokens": 450,
              "outputTokens": 1250
            }
          },
          "turn": 1,
          "evaluations": {
            "candy": {
              "state": "complete",
              "completed": 1,
              "total": 1,
              "valid": 1,
              "errors": 0,
              "hits": 0,
              "graded": 1,
              "endedAt": 1791864003600,
              "durationMs": 3200,
              "reasoningEffort": "high",
              "artifactAvailable": true
            }
          },
          "behaviorUnavailableReason": null
        }
      ],
      "bank": {
        "source": "ModelTrace",
        "models": [
          "gpt-5.4",
          "gpt-5.5",
          "gpt-5.6-sol",
          "gpt-5.6-terra",
          "gpt-5.6-luna",
          "gpt-6-astra",
          "gpt-6-sol",
          "gpt-6-luna",
          "claude-haiku-4-5-20251001",
          "claude-sonnet-4-6",
          "claude-sonnet-5",
          "claude-opus-4-6",
          "claude-opus-4-7",
          "claude-opus-4-8",
          "claude-opus-5",
          "claude-opus-5-5",
          "claude-sonnet-5-5",
          "claude-haiku-5-5",
          "gpt-6.1-sol"
        ],
        "count": 19
      },
      "behaviorBank": {
        "source": "Candy Eval",
        "models": [
          "gpt-5.5",
          "gpt-5.6-luna",
          "gpt-5.6-sol",
          "gpt-5.6-terra",
          "gpt-6-astra",
          "gpt-6-luna",
          "gpt-6-sol",
          "gpt-6.1-sol"
        ],
        "count": 8,
        "probes": 16
      },
      "activeEvaluation": null,
      "storageWarning": false
    },
    "details": {
      "demo-test-Claude-current": {
        "candy": {
          "ok": true,
          "recordId": "demo-test-Claude-current",
          "kind": "candy",
          "result": {
            "state": "complete",
            "completed": 1,
            "total": 1,
            "valid": 1,
            "errors": 0,
            "hits": 1,
            "graded": 1,
            "endedAt": 1791864003600,
            "durationMs": 3200,
            "reasoningEffort": "high",
            "artifactAvailable": true
          },
          "payload": {
            "answers": [
              {
                "hit": true,
                "answer": "演示回答：21 个糖果。此文本仅用于展示命中与回答详情。",
                "error": null,
                "durationMs": 3200
              }
            ]
          }
        }
      },
      "demo-test-Claude-previous": {
        "candy": {
          "ok": true,
          "recordId": "demo-test-Claude-previous",
          "kind": "candy",
          "result": {
            "state": "complete",
            "completed": 1,
            "total": 1,
            "valid": 1,
            "errors": 0,
            "hits": 0,
            "graded": 1,
            "endedAt": 1791864003600,
            "durationMs": 3200,
            "reasoningEffort": "high",
            "artifactAvailable": true
          },
          "payload": {
            "answers": [
              {
                "hit": false,
                "answer": "演示回答：20 个糖果。",
                "error": null,
                "durationMs": 3100
              }
            ]
          }
        }
      }
    }
  }
};
