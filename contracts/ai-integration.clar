;; AI Integration Contract

(define-data-var ai-oracle principal tx-sender)

(define-map idea-evaluations uint
  {
    idea-id: uint,
    score: uint,
    feedback: (string-utf8 1000)
  }
)

(define-public (set-ai-oracle (new-oracle principal))
  (begin
    (asserts! (is-eq tx-sender (var-get ai-oracle)) (err u403))
    (var-set ai-oracle new-oracle)
    (ok true)
  )
)

(define-public (evaluate-idea (idea-id uint) (score uint) (feedback (string-utf8 1000)))
  (begin
    (asserts! (is-eq tx-sender (var-get ai-oracle)) (err u403))
    (map-set idea-evaluations idea-id
      {
        idea-id: idea-id,
        score: score,
        feedback: feedback
      }
    )
    (ok true)
  )
)

(define-read-only (get-idea-evaluation (idea-id uint))
  (ok (unwrap! (map-get? idea-evaluations idea-id) (err u404)))
)

(define-read-only (get-ai-oracle)
  (ok (var-get ai-oracle))
)

